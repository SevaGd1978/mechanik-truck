package ru.mechaniktruck.app.ui.screens.maintenance

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import ru.mechaniktruck.app.R
import ru.mechaniktruck.app.data.local.entity.VehicleEntity
import ru.mechaniktruck.app.ui.util.formatDateOrDash
import ru.mechaniktruck.app.ui.viewmodel.FleetViewModel
import kotlin.math.abs
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceScreen(
    onBack: () -> Unit,
    viewModel: FleetViewModel = viewModel(),
) {
    val vehicles by viewModel.vehicles.collectAsState()
    val sorted = vehicles.sortedBy { kmLeft(it) ?: Int.MAX_VALUE }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.maintenance_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.back),
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
    ) { padding ->
        if (sorted.isEmpty()) {
            Text(
                text = stringResource(R.string.fleet_empty),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                style = MaterialTheme.typography.bodyLarge,
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
            ) {
                items(sorted, key = { it.id }) { vehicle ->
                    MaintenanceCard(vehicle = vehicle)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun MaintenanceCard(vehicle: VehicleEntity) {
    val left = kmLeft(vehicle)
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = vehicle.plate,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(text = vehicle.model, style = MaterialTheme.typography.bodyLarge)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(
                    R.string.current_odometer,
                    vehicle.odometer.roundToInt(),
                ),
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                text = remainingLabel(left),
                style = MaterialTheme.typography.labelLarge,
                color = if (left != null && left <= 0) {
                    MaterialTheme.colorScheme.error
                } else {
                    MaterialTheme.colorScheme.secondary
                },
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(
                    R.string.last_service_km,
                    formatDateOrDash(vehicle.lastService),
                    vehicle.lastServiceOdometer.roundToInt(),
                ),
                style = MaterialTheme.typography.bodyMedium,
            )
            if (vehicle.lastServiceNote.isNotBlank()) {
                Text(
                    text = vehicle.lastServiceNote,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = stringResource(
                    R.string.next_service_km,
                    formatDateOrDash(vehicle.nextService),
                    vehicle.nextServiceOdometer.roundToInt(),
                ),
                style = MaterialTheme.typography.bodyMedium,
            )
            if (vehicle.nextServiceNote.isNotBlank()) {
                Text(
                    text = vehicle.nextServiceNote,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

private fun kmLeft(vehicle: VehicleEntity): Int? {
    if (vehicle.nextServiceOdometer <= 0.0) return null
    return (vehicle.nextServiceOdometer - vehicle.odometer).roundToInt()
}

private fun remainingLabel(km: Int?): String {
    if (km == null) return "Пробег планового ТО не задан"
    return if (km <= 0) {
        "Просрочено на ${abs(km)} км"
    } else {
        "Осталось $km км"
    }
}
