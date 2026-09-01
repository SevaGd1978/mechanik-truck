package ru.mechaniktruck.app.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "mechanik_prefs")

class PreferencesManager(private val context: Context) {

    companion object {
        const val DEFAULT_API_BASE_URL = "https://mechanik-truck-sevagd1978.amvera.io"

        private val KEY_TOKEN = stringPreferencesKey("auth_token")
        private val KEY_USER_ID = stringPreferencesKey("user_id")
        private val KEY_USER_LOGIN = stringPreferencesKey("user_login")
        private val KEY_USER_NAME = stringPreferencesKey("user_name")
        private val KEY_USER_ROLE = stringPreferencesKey("user_role")
        private val KEY_API_BASE_URL = stringPreferencesKey("api_base_url")
        private val KEY_LAST_SYNC_AT = longPreferencesKey("last_sync_at")
        private val KEY_IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
    }

    val isLoggedIn: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_IS_LOGGED_IN] == true && !prefs[KEY_TOKEN].isNullOrBlank()
    }

    val apiBaseUrl: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_API_BASE_URL] ?: DEFAULT_API_BASE_URL
    }

    val lastSyncAt: Flow<Long?> = context.dataStore.data.map { prefs ->
        prefs[KEY_LAST_SYNC_AT]
    }

    val userName: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_USER_NAME]
    }

    val userLogin: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_USER_LOGIN]
    }

    val userRole: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_USER_ROLE]
    }

    fun getTokenBlocking(): String = runBlocking {
        context.dataStore.data.first()[KEY_TOKEN] ?: ""
    }

    fun getApiBaseUrlBlocking(): String = runBlocking {
        context.dataStore.data.first()[KEY_API_BASE_URL] ?: DEFAULT_API_BASE_URL
    }

    suspend fun saveLogin(token: String, userId: String, login: String, name: String, role: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = token
            prefs[KEY_USER_ID] = userId
            prefs[KEY_USER_LOGIN] = login
            prefs[KEY_USER_NAME] = name
            prefs[KEY_USER_ROLE] = role
            prefs[KEY_IS_LOGGED_IN] = true
        }
    }

    suspend fun saveApiBaseUrl(url: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_API_BASE_URL] = url.trim().removeSuffix("/")
        }
    }

    suspend fun saveLastSyncAt(timestamp: Long) {
        context.dataStore.edit { prefs ->
            prefs[KEY_LAST_SYNC_AT] = timestamp
        }
    }

    suspend fun logout() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_USER_ID)
            prefs.remove(KEY_USER_LOGIN)
            prefs.remove(KEY_USER_NAME)
            prefs.remove(KEY_USER_ROLE)
            prefs[KEY_IS_LOGGED_IN] = false
        }
    }
}
