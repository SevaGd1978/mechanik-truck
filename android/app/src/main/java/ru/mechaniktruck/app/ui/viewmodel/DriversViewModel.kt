package ru.mechaniktruck.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import ru.mechaniktruck.app.MechanikApp
import ru.mechaniktruck.app.data.local.entity.DriverEntity

class DriversViewModel(application: Application) : AndroidViewModel(application) {

    private val syncRepository = (application as MechanikApp).syncRepository

    val drivers: StateFlow<List<DriverEntity>> = syncRepository.drivers()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList(),
        )
}
