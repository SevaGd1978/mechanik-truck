package ru.mechaniktruck.app.data.api

data class LoginRequest(
    val login: String,
    val password: String,
)

data class UserDto(
    val id: String,
    val login: String,
    val name: String,
    val role: String,
    val active: Boolean,
    val createdAt: String,
)

data class LoginResponse(
    val token: String,
    val user: UserDto,
)

data class ServiceRecordDto(
    val id: String = "",
    val date: String = "",
    val odometer: Double = 0.0,
    val note: String = "",
    val nextDate: String = "",
    val nextOdometer: Double = 0.0,
    val nextNote: String = "",
)

data class VehicleDto(
    val id: String,
    val plate: String,
    val model: String,
    val type: String = "",
    val driver: String = "",
    val odometer: Double = 0.0,
    val costPerKm: Double = 0.0,
    val fuelNorm: Double = 0.0,
    val fuelFact: Double = 0.0,
    val lastService: String = "",
    val lastServiceNote: String = "",
    val lastServiceOdometer: Double = 0.0,
    val nextService: String = "",
    val nextServiceNote: String = "",
    val nextServiceOdometer: Double = 0.0,
    val serviceHistory: List<ServiceRecordDto> = emptyList(),
    val status: String = "active",
)

data class DriverDto(
    val id: String,
    val lastName: String = "",
    val firstName: String = "",
    val middleName: String = "",
    val phone: String = "",
    val tabNumber: String = "",
    val snils: String = "",
    val status: String = "active",
    val hiredAt: String = "",
    val passportSeries: String = "",
    val passportNumber: String = "",
    val passportIssuedBy: String = "",
    val passportIssuedAt: String = "",
    val passportDeptCode: String = "",
    val birthDate: String = "",
    val birthPlace: String = "",
    val registrationAddress: String = "",
    val licenseSeries: String = "",
    val licenseNumber: String = "",
    val licenseCategories: String = "",
    val licenseIssuedAt: String = "",
    val licenseExpiresAt: String = "",
    val licenseIssuedBy: String = "",
    val vehicleId: String = "",
    val notes: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
)

data class SyncResponse(
    val vehicles: List<VehicleDto> = emptyList(),
    val drivers: List<DriverDto> = emptyList(),
    val updatedAt: String? = null,
    val store: String? = null,
    val ok: Boolean? = null,
    val error: String? = null,
)

data class SyncPushRequest(
    val vehicles: List<VehicleDto>? = null,
    val drivers: List<DriverDto>? = null,
    val deletedVehicleIds: List<String>? = null,
    val deletedDriverIds: List<String>? = null,
)

data class ErrorResponse(
    val error: String? = null,
)
