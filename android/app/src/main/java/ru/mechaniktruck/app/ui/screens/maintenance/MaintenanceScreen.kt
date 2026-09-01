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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import ru.mechaniktruck.app.R
import ru.mechaniktruck.app.data.local.entity.VehicleEntity
import ru.mechaniktruck.app.data.local.parseServiceHistory
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
                item {
                    Spacer(modifier = Modifier.height(12.dp))
                    ConductServiceCard(
                        vehicles = sorted,
                        onSave = { vehicle, date, odometer, note, nextDate, nextOdometer, nextNote ->
                            viewModel.recordConductedService(
                                vehicle = vehicle,
                                date = date,
                                odometer = odometer,
                                note = note,
                                nextDate = nextDate,
                                nextOdometer = nextOdometer,
                                nextNote = nextNote,
                            )
                        },
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
                items(sorted, key = { it.id }) { vehicle ->
                    MaintenanceCard(vehicle = vehicle)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ConductServiceCard(
    vehicles: List<VehicleEntity>,
    onSave: (
        vehicle: VehicleEntity,
        date: String,
        odometer: Double,
        note: String,
        nextDate: String,
        nextOdometer: Double,
        nextNote: String,
    ) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf(vehicles.firstOrNull()) }
    var date by remember { mutableStateOf(FleetViewModel.todayIso()) }
    var odometer by remember {
        mutableStateOf(selected?.odometer?.roundToInt()?.toString().orEmpty())
    }
    var note by remember { mutableStateOf("") }
    var nextDate by remember { mutableStateOf(FleetViewModel.defaultNextDate(date)) }
    var nextOdometer by remember {
        mutableStateOf(
            FleetViewModel.defaultNextOdometer(selected?.odometer ?: 0.0)
                .roundToInt()
                .toString(),
        )
    }
    var nextNote by remember { mutableStateOf(selected?.nextServiceNote.orEmpty()) }
    var saved by remember { mutableStateOf(false) }

    fun applyVehicle(vehicle: VehicleEntity) {
        selected = vehicle
        odometer = vehicle.odometer.roundToInt().toString()
        nextOdometer = FleetViewModel.defaultNextOdometer(vehicle.odometer)
            .roundToInt()
            .toString()
        nextNote = vehicle.nextServiceNote
        saved = false
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.conduct_service_title),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = stringResource(R.string.conduct_service_hint),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.height(12.dp))
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = it },
            ) {
                OutlinedTextField(
                    value = selected?.let { "${it.plate} · ${it.model}" }.orEmpty(),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.vehicle_label)) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth(),
                )
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                ) {
                    vehicles.forEach { vehicle ->
                        DropdownMenuItem(
                            text = { Text("${vehicle.plate} · ${vehicle.model}") },
                            onClick = {
                                applyVehicle(vehicle)
                                expanded = false
                            },
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = date,
                onValueChange = {
                    date = it
                    nextDate = FleetViewModel.defaultNextDate(it)
                },
                label = { Text(stringResource(R.string.conduct_date_label)) },
                placeholder = { Text("ГГГГ-ММ-ДД") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = odometer,
                onValueChange = {
                    odometer = it
                    val km = it.toDoubleOrNull() ?: 0.0
                    nextOdometer = FleetViewModel.defaultNextOdometer(km).roundToInt().toString()
                },
                label = { Text(stringResource(R.string.conduct_odometer_label)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = note,
                onValueChange = { note = it },
                label = { Text(stringResource(R.string.conduct_work_label)) },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = nextDate,
                onValueChange = { nextDate = it },
                label = { Text(stringResource(R.string.next_service_date_label)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = nextOdometer,
                onValueChange = { nextOdometer = it },
                label = { Text(stringResource(R.string.next_service_odometer_label)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = nextNote,
                onValueChange = { nextNote = it },
                label = { Text(stringResource(R.string.next_service_work_label)) },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = {
                    val vehicle = selected ?: return@Button
                    if (date.isBlank()) return@Button
                    onSave(
                        vehicle,
                        date,
                        odometer.toDoubleOrNull() ?: 0.0,
                        note,
                        nextDate,
                        nextOdometer.toDoubleOrNull() ?: 0.0,
                        nextNote,
                    )
                    note = ""
                    saved = true
                },
                enabled = selected != null && date.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.save_conduct_date))
            }
            if (saved) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.conduct_saved),
                    color = MaterialTheme.colorScheme.secondary,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

@Composable
private fun MaintenanceCard(vehicle: VehicleEntity) {
    val left = kmLeft(vehicle)
    val history = parseServiceHistory(vehicle.serviceHistoryJson)
        .sortedByDescending { it.date }
        .take(3)
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
            if (history.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.service_history_title),
                    style = MaterialTheme.typography.labelLarge,
                )
                history.forEach { record ->
                    Text(
                        text = "${formatDateOrDash(record.date)} · ${record.odometer.roundToInt()} км" +
                            if (record.note.isNotBlank()) " · ${record.note}" else "",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
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
