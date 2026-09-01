package ru.mechaniktruck.app.data.repository

import androidx.room.withTransaction
import kotlinx.coroutines.flow.Flow
import ru.mechaniktruck.app.data.api.RetrofitProvider
import ru.mechaniktruck.app.data.api.SyncPushRequest
import ru.mechaniktruck.app.data.datastore.PreferencesManager
import ru.mechaniktruck.app.data.local.AppDatabase
import ru.mechaniktruck.app.data.local.entity.DriverEntity
import ru.mechaniktruck.app.data.local.entity.VehicleEntity
import ru.mechaniktruck.app.data.local.toDto
import ru.mechaniktruck.app.data.local.toEntity

sealed class SyncResult {
    data class Success(val vehicleCount: Int, val driverCount: Int) : SyncResult()
    data class Error(val message: String) : SyncResult()
}

class SyncRepository(
    private val database: AppDatabase,
    private val preferencesManager: PreferencesManager,
    private val retrofitProvider: RetrofitProvider,
) {

    private val vehicleDao = database.vehicleDao()
    private val driverDao = database.driverDao()

    fun vehicleCount(): Flow<Int> = vehicleDao.countFlow()
    fun driverCount(): Flow<Int> = driverDao.countFlow()
    fun vehicles(): Flow<List<VehicleEntity>> = vehicleDao.getAllFlow()
    fun drivers(): Flow<List<DriverEntity>> = driverDao.getAllFlow()
    val lastSyncAt: Flow<Long?> = preferencesManager.lastSyncAt

    suspend fun sync(): SyncResult {
        return try {
            pushLocalChanges()
            pullRemoteSnapshot()
        } catch (e: Exception) {
            SyncResult.Error(e.message ?: "Ошибка синхронизации")
        }
    }

    suspend fun pullOnly(): SyncResult {
        return try {
            pullRemoteSnapshot()
        } catch (e: Exception) {
            SyncResult.Error(e.message ?: "Ошибка синхронизации")
        }
    }

    private suspend fun pushLocalChanges() {
        val dirtyVehicles = vehicleDao.getDirtyAndDeleted()
        val dirtyDrivers = driverDao.getDirtyAndDeleted()

        if (dirtyVehicles.isEmpty() && dirtyDrivers.isEmpty()) {
            return
        }

        val vehiclesToPush = dirtyVehicles.filter { it.isDirty && !it.isDeleted }.map { it.toDto() }
        val driversToPush = dirtyDrivers.filter { it.isDirty && !it.isDeleted }.map { it.toDto() }
        val deletedVehicleIds = dirtyVehicles.filter { it.isDeleted }.map { it.id }
        val deletedDriverIds = dirtyDrivers.filter { it.isDeleted }.map { it.id }

        val request = SyncPushRequest(
            vehicles = vehiclesToPush.ifEmpty { null },
            drivers = driversToPush.ifEmpty { null },
            deletedVehicleIds = deletedVehicleIds.ifEmpty { null },
            deletedDriverIds = deletedDriverIds.ifEmpty { null },
        )

        val api = retrofitProvider.getApiService()
        val response = api.pushSync(request)
        if (!response.isSuccessful) {
            val error = response.errorBody()?.string() ?: "Ошибка отправки данных"
            throw IllegalStateException(error)
        }

        val body = response.body()
        if (body != null) {
            replaceLocalData(body.vehicles.map { it.toEntity() }, body.drivers.map { it.toEntity() })
            preferencesManager.saveLastSyncAt(System.currentTimeMillis())
        }
    }

    private suspend fun pullRemoteSnapshot(): SyncResult {
        val api = retrofitProvider.getApiService()
        val response = api.pullSync()
        if (!response.isSuccessful) {
            val error = response.errorBody()?.string() ?: "Ошибка получения данных"
            return SyncResult.Error(error)
        }

        val body = response.body()
        if (body == null) {
            return SyncResult.Error("Пустой ответ сервера")
        }

        replaceLocalData(
            body.vehicles.map { it.toEntity() },
            body.drivers.map { it.toEntity() },
        )
        preferencesManager.saveLastSyncAt(System.currentTimeMillis())

        return SyncResult.Success(
            vehicleCount = body.vehicles.size,
            driverCount = body.drivers.size,
        )
    }

    private suspend fun replaceLocalData(vehicles: List<VehicleEntity>, drivers: List<DriverEntity>) {
        database.withTransaction {
            vehicleDao.deleteAll()
            driverDao.deleteAll()
            if (vehicles.isNotEmpty()) {
                vehicleDao.upsertAll(vehicles)
            }
            if (drivers.isNotEmpty()) {
                driverDao.upsertAll(drivers)
            }
        }
    }
}
