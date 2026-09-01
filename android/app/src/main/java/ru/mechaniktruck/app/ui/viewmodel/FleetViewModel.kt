package ru.mechaniktruck.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import ru.mechaniktruck.app.MechanikApp
import ru.mechaniktruck.app.data.local.entity.VehicleEntity

class FleetViewModel(application: Application) : AndroidViewModel(application) {

    private val syncRepository = (application as MechanikApp).syncRepository

    val vehicles: StateFlow<List<VehicleEntity>> = syncRepository.vehicles()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList(),
        )
}
