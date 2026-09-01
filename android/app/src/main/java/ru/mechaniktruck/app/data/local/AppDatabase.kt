package ru.mechaniktruck.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import ru.mechaniktruck.app.data.local.dao.DriverDao
import ru.mechaniktruck.app.data.local.dao.VehicleDao
import ru.mechaniktruck.app.data.local.entity.DriverEntity
import ru.mechaniktruck.app.data.local.entity.VehicleEntity

@Database(
    entities = [VehicleEntity::class, DriverEntity::class],
    version = 2,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun vehicleDao(): VehicleDao
    abstract fun driverDao(): DriverDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "mechanik_truck.db",
                ).fallbackToDestructiveMigration().build().also { INSTANCE = it }
            }
        }
    }
}
