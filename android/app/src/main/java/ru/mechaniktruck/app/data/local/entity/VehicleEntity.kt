package ru.mechaniktruck.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "vehicles")
data class VehicleEntity(
    @PrimaryKey val id: String,
    val plate: String,
    val model: String,
    val type: String,
    val driver: String,
    val odometer: Double,
    val costPerKm: Double,
    val fuelNorm: Double,
    val fuelFact: Double,
    val lastService: String,
    val lastServiceNote: String,
    val nextService: String,
    val nextServiceNote: String,
    val status: String,
    val isDirty: Boolean = false,
    val isDeleted: Boolean = false,
)
