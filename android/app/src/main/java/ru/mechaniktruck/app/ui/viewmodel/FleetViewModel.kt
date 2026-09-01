package ru.mechaniktruck.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import ru.mechaniktruck.app.MechanikApp
import ru.mechaniktruck.app.data.api.ServiceRecordDto
import ru.mechaniktruck.app.data.local.entity.VehicleEntity
import ru.mechaniktruck.app.data.local.parseServiceHistory
import java.time.LocalDate
import kotlin.math.max

class FleetViewModel(application: Application) : AndroidViewModel(application) {

    private val syncRepository = (application as MechanikApp).syncRepository
    private val gson = Gson()

    val vehicles: StateFlow<List<VehicleEntity>> = syncRepository.vehicles()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList(),
        )

    fun recordConductedService(
        vehicle: VehicleEntity,
        date: String,
        odometer: Double,
        note: String,
        nextDate: String,
        nextOdometer: Double,
        nextNote: String,
    ) {
        viewModelScope.launch {
            val history = parseServiceHistory(vehicle.serviceHistoryJson)
                .filterNot { it.date == date }
                .toMutableList()
            history.add(
                ServiceRecordDto(
                    id = "to-${System.currentTimeMillis()}",
                    date = date,
                    odometer = odometer,
                    note = note,
                    nextDate = nextDate,
                    nextOdometer = nextOdometer,
                    nextNote = nextNote,
                ),
            )
            history.sortBy { it.date }
            val latest = history.last()
            syncRepository.upsertVehicle(
                vehicle.copy(
                    lastService = latest.date,
                    lastServiceOdometer = latest.odometer,
                    lastServiceNote = latest.note,
                    nextService = latest.nextDate,
                    nextServiceOdometer = latest.nextOdometer,
                    nextServiceNote = latest.nextNote,
                    odometer = max(vehicle.odometer, latest.odometer),
                    serviceHistoryJson = gson.toJson(history),
                    isDirty = true,
                    isDeleted = false,
                ),
            )
        }
    }

    companion object {
        fun todayIso(): String = LocalDate.now().toString()

        fun defaultNextDate(conducted: String): String {
            return try {
                LocalDate.parse(conducted).plusDays(90).toString()
            } catch (_: Exception) {
                LocalDate.now().plusDays(90).toString()
            }
        }

        fun defaultNextOdometer(km: Double): Double = km + 15_000.0
    }
}
