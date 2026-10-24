import { useState } from 'react'
import { Outlet } from 'react-router'
import Header, { BottomNav } from '../components/Header'
import { AddActionDialog } from '../components/AddActionDialog'
import type { LayoutContext } from './useLayout'

export default function RootLayout() {
    const [dialog, setDialog] = useState<{ open: boolean; pillarId?: string }>({ open: false })
    const context: LayoutContext = { openAddAction: (pillarId) => setDialog({ open: true, pillarId }) }
    const openBlank = () => context.openAddAction()

    return (
        <>
            <Header onAdd={openBlank} />
            <main>
                <Outlet context={context} />
            </main>
            <BottomNav onAdd={openBlank} />
            <AddActionDialog open={dialog.open} pillarId={dialog.pillarId} onClose={() => setDialog({ open: false })} />
        </>
    )

}
