export class JsonFileGateway {
    async load(fileName: string): Promise<string | null> {
        if (!window.electron) {
            return null
        }

        const { success, data, error } = await window.electron.loadData(fileName)
        if (!success) {
            throw new Error(error)
        }

        return data ?? null
    }

    async save(fileName: string, json: string): Promise<void> {
        if (!window.electron) {
            return
        }

        const { success, error } = await window.electron.saveData(fileName, json)
        if (!success) {
            throw new Error(error)
        }
    }
}
