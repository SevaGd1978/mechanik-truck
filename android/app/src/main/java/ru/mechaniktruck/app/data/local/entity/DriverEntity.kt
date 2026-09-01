package ru.mechaniktruck.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "drivers")
data class DriverEntity(
    @PrimaryKey val id: String,
    val lastName: String,
    val firstName: String,
    val middleName: String,
    val phone: String,
    val tabNumber: String,
    val snils: String,
    val status: String,
    val hiredAt: String,
    val passportSeries: String,
    val passportNumber: String,
    val passportIssuedBy: String,
    val passportIssuedAt: String,
    val passportDeptCode: String,
    val birthDate: String,
    val birthPlace: String,
    val registrationAddress: String,
    val licenseSeries: String,
    val licenseNumber: String,
    val licenseCategories: String,
    val licenseIssuedAt: String,
    val licenseExpiresAt: String,
    val licenseIssuedBy: String,
    val vehicleId: String,
    val notes: String,
    val createdAt: String,
    val updatedAt: String,
    val isDirty: Boolean = false,
    val isDeleted: Boolean = false,
)
