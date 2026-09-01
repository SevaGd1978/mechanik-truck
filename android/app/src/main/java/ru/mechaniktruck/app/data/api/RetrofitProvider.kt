package ru.mechaniktruck.app.data.api

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import ru.mechaniktruck.app.BuildConfig
import ru.mechaniktruck.app.data.datastore.PreferencesManager
import java.util.concurrent.TimeUnit

class RetrofitProvider(
    private val preferencesManager: PreferencesManager,
) {
  private val gson: Gson = GsonBuilder().create()

  @Volatile
  private var cachedBaseUrl: String? = null

  @Volatile
  private var cachedApiService: ApiService? = null

  fun getApiService(): ApiService {
    val baseUrl = preferencesManager.getApiBaseUrlBlocking().let { url ->
      if (url.endsWith("/")) url else "$url/"
    }
    val current = cachedApiService
    if (current != null && cachedBaseUrl == baseUrl) {
      return current
    }
    return synchronized(this) {
      val again = cachedApiService
      if (again != null && cachedBaseUrl == baseUrl) {
        again
      } else {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
        val client = OkHttpClient.Builder()
          .addInterceptor(AuthInterceptor(preferencesManager))
          .addInterceptor(logging)
          .connectTimeout(30, TimeUnit.SECONDS)
          .readTimeout(30, TimeUnit.SECONDS)
          .writeTimeout(30, TimeUnit.SECONDS)
          .build()

        val retrofit = Retrofit.Builder()
          .baseUrl(baseUrl)
          .client(client)
          .addConverterFactory(GsonConverterFactory.create(gson))
          .build()

        cachedBaseUrl = baseUrl
        cachedApiService = retrofit.create(ApiService::class.java)
        cachedApiService!!
      }
    }
  }

  fun invalidate() {
    synchronized(this) {
      cachedBaseUrl = null
      cachedApiService = null
    }
  }
}
