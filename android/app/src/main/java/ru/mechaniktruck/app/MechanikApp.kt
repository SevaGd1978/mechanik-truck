package ru.mechaniktruck.app

import android.app.Application
import ru.mechaniktruck.app.data.api.RetrofitProvider
import ru.mechaniktruck.app.data.datastore.PreferencesManager
import ru.mechaniktruck.app.data.local.AppDatabase
import ru.mechaniktruck.app.data.repository.AuthRepository
import ru.mechaniktruck.app.data.repository.SyncRepository

class MechanikApp : Application() {

    lateinit var preferencesManager: PreferencesManager
    lateinit var database: AppDatabase
    lateinit var retrofitProvider: RetrofitProvider
    lateinit var authRepository: AuthRepository
    lateinit var syncRepository: SyncRepository

    override fun onCreate() {
        super.onCreate()
        preferencesManager = PreferencesManager(this)
        database = AppDatabase.getInstance(this)
        retrofitProvider = RetrofitProvider(preferencesManager)
        authRepository = AuthRepository(preferencesManager, retrofitProvider)
        syncRepository = SyncRepository(database, preferencesManager, retrofitProvider)
    }
}
