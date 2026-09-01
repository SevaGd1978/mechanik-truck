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

data class SettingsUiState(
    val apiUrl: String = "",
    val userName: String? = null,
    val userLogin: String? = null,
    val userRole: String? = null,
    val isSaving: Boolean = false,
    val savedMessage: String? = null,
)

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val app = application as MechanikApp
    private val preferencesManager = app.preferencesManager

    private val apiUrlInput = MutableStateFlow("")
    private val isSaving = MutableStateFlow(false)
    private val savedMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<SettingsUiState> = combine(
        apiUrlInput,
        preferencesManager.userName,
        preferencesManager.userLogin,
        preferencesManager.userRole,
        isSaving,
        savedMessage,
    ) { values ->
        SettingsUiState(
            apiUrl = values[0] as String,
            userName = values[1] as String?,
            userLogin = values[2] as String?,
            userRole = values[3] as String?,
            isSaving = values[4] as Boolean,
            savedMessage = values[5] as String?,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = SettingsUiState(),
    )

    init {
        viewModelScope.launch {
            preferencesManager.apiBaseUrl.collect { url ->
                apiUrlInput.value = url
            }
        }
    }

    fun onApiUrlChange(value: String) {
        apiUrlInput.value = value
        savedMessage.value = null
    }

    fun save() {
        val url = apiUrlInput.value.trim()
        if (url.isBlank()) return

        viewModelScope.launch {
            isSaving.value = true
            preferencesManager.saveApiBaseUrl(url)
            app.retrofitProvider.invalidate()
            savedMessage.value = "Настройки сохранены"
            isSaving.value = false
        }
    }

    fun clearMessage() {
        savedMessage.value = null
    }
}
