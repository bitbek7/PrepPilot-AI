import { createContext, useState } from "react";
export const InterviewContext = createContext();
export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reports, setReports] = useState([]); //at starting empty array as it contains reports
    return (
        <InterviewContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports }}>
            {children}
        </InterviewContext.Provider>
    )
}  //iske andhar wrap karna padega puri application