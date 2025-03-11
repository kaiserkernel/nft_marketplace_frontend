export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Default format (depends on user locale)
};