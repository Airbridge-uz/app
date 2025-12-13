
export interface Airport {
    iata_code: string;
    name: string;
    city: string;
    country: string;
    country_code: string;
}

export const airportService = {
    async search(query: string): Promise<Airport[]> {
        if (!query || query.length < 1) return [];

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/airports/search?query=${encodeURIComponent(query)}&limit=10`);

            if (!response.ok) {
                throw new Error('Failed to fetch airports');
            }

            return await response.json();
        } catch (error) {
            console.error('Airport search error:', error);
            return [];
        }
    }
};
