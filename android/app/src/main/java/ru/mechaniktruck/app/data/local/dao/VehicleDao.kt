package ru.mechaniktruck.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import ru.mechaniktruck.app.data.local.entity.VehicleEntity

@Dao
interface VehicleDao {

    @Query("SELECT * FROM vehicles WHERE isDeleted = 0 ORDER BY plate ASC")
    fun getAllFlow(): Flow<List<VehicleEntity>>

    @Query("SELECT * FROM vehicles WHERE isDeleted = 0 ORDER BY plate ASC")
    suspend fun getAll(): List<VehicleEntity>

    @Query("SELECT COUNT(*) FROM vehicles WHERE isDeleted = 0")
    fun countFlow(): Flow<Int>

    @Query("SELECT * FROM vehicles WHERE isDirty = 1 OR isDeleted = 1")
    suspend fun getDirtyAndDeleted(): List<VehicleEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(vehicles: List<VehicleEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(vehicle: VehicleEntity)

    @Query("DELETE FROM vehicles")
    suspend fun deleteAll()

    @Query("UPDATE vehicles SET isDirty = 0, isDeleted = 0")
    suspend fun clearDirtyFlags()
}
