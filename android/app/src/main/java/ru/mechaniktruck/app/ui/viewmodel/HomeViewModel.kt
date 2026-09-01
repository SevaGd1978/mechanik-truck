package ru.mechaniktruck.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import ru.mechaniktruck.app.MechanikApp
import ru.mechaniktruck.app.data.repository.SyncResult

data class HomeUiState(
    val vehicleCount: Int = 0,
    val driverCount: Int = 0,
    val lastSyncAt: Long? = null,
    val userName: String? = null,
    val isSyncing: Boolean = false,
    val syncMessage: String? = null,
    val syncError: String? = null,
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val app = application as MechanikApp
    private val syncRepository = app.syncRepository
    private val preferencesManager = app.preferencesManager

    private val isSyncing = MutableStateFlow(false)
    private val syncMessage = MutableStateFlow<String?>(null)
    private val syncError = MutableStateFlow<String?>(null)

    val uiState: StateFlow<HomeUiState> = combine(
        combine(
            syncRepository.vehicleCount(),
            syncRepository.driverCount(),
            syncRepository.lastSyncAt,
        ) { vehicleCount, driverCount, lastSyncAt ->
            Triple(vehicleCount, driverCount, lastSyncAt)
        },
        preferencesManager.userName,
        isSyncing,
        syncMessage,
        syncError,
    ) { counts, userName, syncing, message, error ->
        HomeUiState(
            vehicleCount = counts.first,
            driverCount = counts.second,
            lastSyncAt = counts.third,
            userName = userName,
            isSyncing = syncing,
            syncMessage = message,
            syncError = error,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HomeUiState(),
    )

    fun sync() {
        if (isSyncing.value) return
        viewModelScope.launch {
            isSyncing.value = true
            syncError.value = null
            syncMessage.value = null
            when (val result = syncRepository.sync()) {
                is SyncResult.Success -> {
                    syncMessage.value = "Синхронизация выполнена: ${result.vehicleCount} авто, ${result.driverCount} водителей"
                }
                is SyncResult.Error -> {
                    syncError.value = result.message
                }
            }
            isSyncing.value = false
        }
    }

    fun clearMessages() {
        syncMessage.value = null
        syncError.value = null
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            app.authRepository.logout()
            onLoggedOut()
        }
    }
}
