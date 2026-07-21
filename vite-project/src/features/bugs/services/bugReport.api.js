import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8888",
    withCredentials: true,
});

/**
 * @description Submit a new bug report
 */
export async function submitBugReport(bugData) {
    const response = await api.post("/api/bugs", bugData);
    return response.data;
}

/**
 * @description Get all bug reports for the logged-in user
 */
export async function getUserBugReports() {
    const response = await api.get("/api/bugs");
    return response.data;
}

/**
 * @description Get a single bug report by ID
 */
export async function getBugReportById(bugId) {
    const response = await api.get(`/api/bugs/${bugId}`);
    return response.data;
}
