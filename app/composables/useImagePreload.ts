export const preloadImage = async (
    src: string | null | undefined,
): Promise<void> => {
    if (!import.meta.client || !src) return

    await new Promise<void>(resolve => {
        const image = new Image()
        image.decoding = 'async'
        image.onload = () => {
            const decode = image.decode?.()
            if (!decode) {
                resolve()
                return
            }

            decode.then(() => resolve()).catch(() => resolve())
        }
        image.onerror = () => resolve()
        image.src = src
    })
}

export const preloadImages = async (
    sources: Array<string | null | undefined>,
): Promise<void> => {
    const uniqueSources = [...new Set(sources.filter(Boolean))] as string[]
    await Promise.all(uniqueSources.map(source => preloadImage(source)))
}
