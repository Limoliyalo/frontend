declare module '#app' {
    interface PageHelp {
        title?: string
        body: string
    }

    interface PageMeta {
        pageTitle?: string
        pageHelp?: PageHelp
        /** If true, inner-page layout main column scrolls vertically */
        scrollMainContent?: boolean
    }
}

export {}
