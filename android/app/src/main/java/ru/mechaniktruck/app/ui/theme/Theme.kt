package ru.mechaniktruck.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = TealPrimary,
    onPrimary = OnTeal,
    primaryContainer = TealLight,
    onPrimaryContainer = TealDeep,
    secondary = SteelMedium,
    onSecondary = OnTeal,
    secondaryContainer = SteelLight,
    onSecondaryContainer = SteelDark,
    tertiary = TealDeep,
    onTertiary = OnTeal,
    background = SurfaceLight,
    onBackground = SteelDark,
    surface = SurfaceCard,
    onSurface = SteelDark,
    surfaceVariant = Color(0xFFE8ECF0),
    onSurfaceVariant = SteelMedium,
    error = ErrorRed,
    onError = OnTeal,
)

private val DarkColorScheme = darkColorScheme(
    primary = TealLight,
    onPrimary = TealDeep,
    primaryContainer = TealDeep,
    onPrimaryContainer = TealLight,
    secondary = SteelLight,
    onSecondary = SteelDark,
    background = Color(0xFF1A2228),
    onBackground = Color(0xFFE8ECF0),
    surface = Color(0xFF243038),
    onSurface = Color(0xFFE8ECF0),
    error = ErrorRed,
)

@Composable
fun MechanikTruckTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content,
    )
}
