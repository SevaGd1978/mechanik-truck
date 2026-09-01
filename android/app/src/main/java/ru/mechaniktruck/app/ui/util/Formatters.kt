package ru.mechaniktruck.app.ui.util

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import ru.mechaniktruck.app.R
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun formatSyncTime(timestamp: Long?): String {
    if (timestamp == null) return ""
    val formatter = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru"))
    return formatter.format(Date(timestamp))
}

fun formatDateOrDash(date: String): String {
    if (date.isBlank()) return "—"
    return date
}

@Composable
fun driverStatusLabel(status: String): String = when (status) {
    "active" -> stringResource(R.string.status_active)
    "vacation" -> stringResource(R.string.status_vacation)
    "sick" -> stringResource(R.string.status_sick)
    "fired" -> stringResource(R.string.status_fired)
    else -> status
}

@Composable
fun vehicleStatusLabel(status: String): String = when (status) {
    "active" -> stringResource(R.string.vehicle_status_active)
    "service" -> stringResource(R.string.vehicle_status_service)
    "idle" -> stringResource(R.string.vehicle_status_idle)
    "alert" -> stringResource(R.string.vehicle_status_alert)
    else -> status
}

fun fullName(lastName: String, firstName: String, middleName: String): String {
    return listOf(lastName, firstName, middleName)
        .filter { it.isNotBlank() }
        .joinToString(" ")
}

fun licenseText(series: String, number: String, categories: String): String {
    val base = listOf(series, number).filter { it.isNotBlank() }.joinToString(" ")
    return if (categories.isNotBlank()) "$base ($categories)" else base.ifBlank { "—" }
}
