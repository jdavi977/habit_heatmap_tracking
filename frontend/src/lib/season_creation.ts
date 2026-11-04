import { supabase } from "./supabase";

// calling season_creation function from supabase
export const season_creation = async (
    s_name: string,
    s_start: string,
    s_finish: string,
    l_title: string,
    l_statement: string,
    p_titles: string[],
) => {
    const { data, error } = await supabase.rpc("season_creation", {
        s_name,
        s_start,
        s_finish,
        l_title,
        l_statement,
        p_titles,
    });

    if (error) throw error;
    return data;
};


const createSeason = async () => {
    try {
        const result = await season_creation(
            "Winter 2026",
            "2026-12-01",
            "2027-02-28",
            "Become a better version of myself",
            "Focus on consistent personal growth.",
            ["Health", "Career", "Relationships"]
        );

        console.log("Season created:", result);

    } catch (error) {
        console.error("Error creating season:", error);
    }
};
