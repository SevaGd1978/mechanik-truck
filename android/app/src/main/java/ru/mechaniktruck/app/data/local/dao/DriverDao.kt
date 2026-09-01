package ru.mechaniktruck.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import ru.mechaniktruck.app.data.local.entity.DriverEntity

@Dao
interface DriverDao {

    @Query("SELECT * FROM drivers WHERE isDeleted = 0 ORDER BY lastName ASC, firstName ASC")
    fun getAllFlow(): Flow<List<DriverEntity>>

    @Query("SELECT * FROM drivers WHERE isDeleted = 0 ORDER BY lastName ASC, firstName ASC")
    suspend fun getAll(): List<DriverEntity>

    @Query("SELECT COUNT(*) FROM drivers WHERE isDeleted = 0")
    fun countFlow(): Flow<Int>

    @Query("SELECT * FROM drivers WHERE isDirty = 1 OR isDeleted = 1")
    suspend fun getDirtyAndDeleted(): List<DriverEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(drivers: List<DriverEntity>)

    @Query("DELETE FROM drivers")
    suspend fun deleteAll()

    @Query("UPDATE drivers SET isDirty = 0, isDeleted = 0")
    suspend fun clearDirtyFlags()
}
