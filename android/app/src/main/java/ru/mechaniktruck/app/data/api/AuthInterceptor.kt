package ru.mechaniktruck.app.data.api

import okhttp3.Interceptor
import okhttp3.Response
import ru.mechaniktruck.app.BuildConfig
import ru.mechaniktruck.app.data.datastore.PreferencesManager

class AuthInterceptor(
    private val preferencesManager: PreferencesManager,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = preferencesManager.getTokenBlocking()
        val request = if (token.isNotBlank()) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}
