package ru.mechaniktruck.app.data.repository

import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import ru.mechaniktruck.app.data.api.ApiService
import ru.mechaniktruck.app.data.api.ErrorResponse
import ru.mechaniktruck.app.data.api.LoginRequest
import ru.mechaniktruck.app.data.api.RetrofitProvider
import ru.mechaniktruck.app.data.datastore.PreferencesManager

sealed class AuthResult {
    data class Success(val name: String) : AuthResult()
    data class Error(val message: String) : AuthResult()
}

class AuthRepository(
    private val preferencesManager: PreferencesManager,
    private val retrofitProvider: RetrofitProvider,
) {

    val isLoggedIn: Flow<Boolean> = preferencesManager.isLoggedIn

    suspend fun login(login: String, password: String): AuthResult {
        if (login.isBlank() || password.isBlank()) {
            return AuthResult.Error("Укажите логин и пароль")
        }
        return try {
            val api = retrofitProvider.getApiService()
            val response = api.login(LoginRequest(login.trim(), password))
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    preferencesManager.saveLogin(
                        token = body.token,
                        userId = body.user.id,
                        login = body.user.login,
                        name = body.user.name,
                        role = body.user.role,
                    )
                    AuthResult.Success(body.user.name)
                } else {
                    AuthResult.Error("Пустой ответ сервера")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val message = parseError(errorBody) ?: "Неверный логин или пароль"
                AuthResult.Error(message)
            }
        } catch (e: Exception) {
            AuthResult.Error(e.message ?: "Ошибка сети")
        }
    }

    suspend fun logout() {
        preferencesManager.logout()
    }

    private fun parseError(body: String?): String? {
        if (body.isNullOrBlank()) return null
        return try {
            Gson().fromJson(body, ErrorResponse::class.java).error
        } catch (_: Exception) {
            null
        }
    }
}
