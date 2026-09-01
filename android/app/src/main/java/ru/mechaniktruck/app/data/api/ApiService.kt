package ru.mechaniktruck.app.data.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("api/sync")
    suspend fun pullSync(): Response<SyncResponse>

    @POST("api/sync")
    suspend fun pushSync(@Body request: SyncPushRequest): Response<SyncResponse>
}
