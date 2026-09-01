package ru.mechaniktruck.app.data.local

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import ru.mechaniktruck.app.data.api.DriverDto
import ru.mechaniktruck.app.data.api.ServiceRecordDto
import ru.mechaniktruck.app.data.api.VehicleDto
import ru.mechaniktruck.app.data.local.entity.DriverEntity
import ru.mechaniktruck.app.data.local.entity.VehicleEntity

private val gson = Gson()
private val historyType = object : TypeToken<List<ServiceRecordDto>>() {}.type

fun parseServiceHistory(json: String?): List<ServiceRecordDto> {
    if (json.isNullOrBlank()) return emptyList()
    return try {
        gson.fromJson<List<ServiceRecordDto>>(json, historyType) ?: emptyList()
    } catch (_: Exception) {
        emptyList()
    }
}

fun VehicleDto.toEntity(isDirty: Boolean = false, isDeleted: Boolean = false): VehicleEntity =
    VehicleEntity(
        id = id,
        plate = plate,
        model = model,
        type = type,
        driver = driver,
        odometer = odometer,
        costPerKm = costPerKm,
        fuelNorm = fuelNorm,
        fuelFact = fuelFact,
        lastService = lastService,
        lastServiceNote = lastServiceNote,
        lastServiceOdometer = lastServiceOdometer,
        nextService = nextService,
        nextServiceNote = nextServiceNote,
        nextServiceOdometer = nextServiceOdometer,
        serviceHistoryJson = gson.toJson(serviceHistory),
        status = status,
        isDirty = isDirty,
        isDeleted = isDeleted,
    )

fun VehicleEntity.toDto(): VehicleDto =
    VehicleDto(
        id = id,
        plate = plate,
        model = model,
        type = type,
        driver = driver,
        odometer = odometer,
        costPerKm = costPerKm,
        fuelNorm = fuelNorm,
        fuelFact = fuelFact,
        lastService = lastService,
        lastServiceNote = lastServiceNote,
        lastServiceOdometer = lastServiceOdometer,
        nextService = nextService,
        nextServiceNote = nextServiceNote,
        nextServiceOdometer = nextServiceOdometer,
        serviceHistory = parseServiceHistory(serviceHistoryJson),
        status = status,
    )

fun DriverDto.toEntity(isDirty: Boolean = false, isDeleted: Boolean = false): DriverEntity =
    DriverEntity(
        id = id,
        lastName = lastName,
        firstName = firstName,
        middleName = middleName,
        phone = phone,
        tabNumber = tabNumber,
        snils = snils,
        status = status,
        hiredAt = hiredAt,
        passportSeries = passportSeries,
        passportNumber = passportNumber,
        passportIssuedBy = passportIssuedBy,
        passportIssuedAt = passportIssuedAt,
        passportDeptCode = passportDeptCode,
        birthDate = birthDate,
        birthPlace = birthPlace,
        registrationAddress = registrationAddress,
        licenseSeries = licenseSeries,
        licenseNumber = licenseNumber,
        licenseCategories = licenseCategories,
        licenseIssuedAt = licenseIssuedAt,
        licenseExpiresAt = licenseExpiresAt,
        licenseIssuedBy = licenseIssuedBy,
        vehicleId = vehicleId,
        notes = notes,
        createdAt = createdAt,
        updatedAt = updatedAt,
        isDirty = isDirty,
        isDeleted = isDeleted,
    )

fun DriverEntity.toDto(): DriverDto =
    DriverDto(
        id = id,
        lastName = lastName,
        firstName = firstName,
        middleName = middleName,
        phone = phone,
        tabNumber = tabNumber,
        snils = snils,
        status = status,
        hiredAt = hiredAt,
        passportSeries = passportSeries,
        passportNumber = passportNumber,
        passportIssuedBy = passportIssuedBy,
        passportIssuedAt = passportIssuedAt,
        passportDeptCode = passportDeptCode,
        birthDate = birthDate,
        birthPlace = birthPlace,
        registrationAddress = registrationAddress,
        licenseSeries = licenseSeries,
        licenseNumber = licenseNumber,
        licenseCategories = licenseCategories,
        licenseIssuedAt = licenseIssuedAt,
        licenseExpiresAt = licenseExpiresAt,
        licenseIssuedBy = licenseIssuedBy,
        vehicleId = vehicleId,
        notes = notes,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
