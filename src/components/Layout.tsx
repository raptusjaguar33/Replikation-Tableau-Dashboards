import * as React from 'react';
import type { } from '@mui/x-date-pickers/themeAugmentation';
import type { } from '@mui/x-charts/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../theme/AppTheme';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations, } from '../theme/customizations';

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};


interface ContainerProps {
    children?: React.ReactNode;
    className?: string;
    props?: object;
}

const Container: React.FC<ContainerProps> = ({ children, className = "", ...props }) => {
    return (
        <>
            <AppTheme {...props} themeComponents={xThemeComponents}>
                <CssBaseline enableColorScheme />
                <Box sx={{
                    display: 'flex',
                    // flexDirection: 'column', // Stellt sicher, dass die Kinder vertikal angeordnet werden
                    justifyContent: 'flex-start', // Hält den Inhalt oben
                    alignItems: 'stretch', // Optional: Lässt den Inhalt die volle Breite einnehmen
                    minHeight: '100vh', // Sorgt dafür, dass die Box die gesamte Bildschirmhöhe nutzt
                }}>
                    <SideMenu />
                    <AppNavbar />
                    {/* Main content */}
                    <Box
                        component="main"
                        sx={(theme) => ({
                            flexGrow: 1,
                            backgroundColor: theme.vars
                                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                                : alpha(theme.palette.background.default, 1),
                            overflow: 'auto',
                        })}
                    >
                        <Stack
                            spacing={2}
                            sx={{
                                alignItems: 'center',
                                mx: 3,
                                pb: 5,
                                mt: { xs: 8, md: 0 },
                            }}
                        >
                            <Header />
                            {children}
                        </Stack>
                    </Box>
                </Box>
            </AppTheme>
        </>
    );
};

export default Container;
