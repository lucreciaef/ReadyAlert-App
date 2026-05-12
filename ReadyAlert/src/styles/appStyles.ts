import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    app: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 64,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 16,
        color: colors.textMuted,
    },
    bottomMenu: {
        height: 76,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    menuButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    menuLabel: {
        fontSize: 12,
        marginTop: 4,
        color: colors.textMuted,
    },
    activeMenuLabel: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
    },
    overlayBackground: {
        flex: 1,
        backgroundColor: colors.overlay,
    },
    sideMenu: {
        width: 280,
        backgroundColor: colors.surface,
        padding: 24,
        paddingTop: 64,
    },
    sideMenuTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    sideMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    sideMenuText: {
        fontSize: 18,
    },
    closeButton: {
        marginTop: 32,
        backgroundColor: colors.primary,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: colors.surface,
        fontWeight: 'bold',
    },
});