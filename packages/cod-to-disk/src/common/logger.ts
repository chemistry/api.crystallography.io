export const getLogger = async () => {
    return {
        log: async (text: string) => {
            console.log(text);
        },
        error: async (text: string) => {
            console.error(text);
        },
        trace: async (text: string) => {
            console.trace(text);
        },
    };
};
