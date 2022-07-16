export const getLogger = async () => {
    return {
        log: async (text: string) => {
            console.log(text);
        },
        error: async (text: string) => {
            console.error(text);
        },
    };
};
