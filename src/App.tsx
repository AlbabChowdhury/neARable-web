import React, { useEffect, useState } from "react";

interface Person {
  first_name: string;
  last_name: string;
  company_name: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  phone1: string;
  phone2: string;
  email: string;
  web: string;
}

function App() {
  const [data, setData] = useState<Person[]>([]);
  const [searchField, setSearchField] = useState<keyof Person>("state");
  const [targetValue, setTargetValue] = useState("");
  const [filteredData, setFilteredData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [stateSummary, setStateSummary] = useState<Record<string, number>>({});
  const [showSummary, setShowSummary] = useState(true);
  const [showVisualSummary, setShowVisualSummary] = useState(true);
  const [summarySortField, setSummarySortField] = useState<"state" | "zip" | "county" | "city">("state");

  const userIcon = "/user.png";
  const companyVideo = "/video.mp4";

  const CSV_parser = (text: string): Person[] => {
    try {
      const cleaned = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/""/g, '"')
        .trim();

      const lines = cleaned.split("\n").filter((line) => line.trim());
      if (lines.length < 2) return [];

      let headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
      if (headers.length !== 12) {
        headers = [
          "first_name", "last_name", "company_name", "address",
          "city", "county", "state", "zip",
          "phone1", "phone2", "email", "web"
        ];
      }

      const result: Person[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(?:[^,"]+|"[^"]*")+/g) || [];
        if (values.length !== headers.length) continue;

        const person: any = {};
        headers.forEach((header, index) => {
          let value = values[index] || "";
          value = value.replace(/^"|"$/g, "").trim();
          person[header] = value;
        });

        result.push(person as Person);
      }

      return result;
    } catch (err) {
      console.error("CSV parsing error:", err);
      return [];
    }
  };

  const getFallbackData = async (): Promise<Person[]> => {
    return [
      {
        first_name: "-",
        last_name: "-",
        company_name: "-",
        address: "-",
        city: "-",
        county: "-",
        state: "-",
        zip: "-",
        phone1: "-",
        phone2: "-",
        email: "-",
        web: "-"
      }
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setUsingFallback(false);

        const response = await fetch(
          "https://raw.githubusercontent.com/jinchen003/Nearabl.Sample.Data/main/us-500.csv",
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error(`Server returned ${response.status}`);

        const text = await response.text();
        const parsedData = CSV_parser(text);

        if (parsedData.length === 0) {
          throw new Error("CSV parsing completed but no valid data found");
        }

        setData(parsedData);
        setFilteredData(parsedData);
      } catch (err) {
        console.error("Data loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setUsingFallback(true);

        const fallbackData = await getFallbackData();
        setData(fallbackData);
        setFilteredData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const summary: Record<string, number> = {};
    data.forEach((person) => {
      const key = person[summarySortField] || "Unknown";
      summary[key] = (summary[key] || 0) + 1;
    });
    setStateSummary(summary);
  }, [data, summarySortField]);

  useEffect(() => {
    if (!targetValue) {
      setFilteredData(data);
      return;
    }

    const results = data.filter((person) =>
      String(person[searchField]).toLowerCase().includes(targetValue.toLowerCase())
    );
    setFilteredData(results);
  }, [targetValue, searchField, data]);

  const renderSingleResult = (person: Person) => {
    if (searchField === "first_name" && filteredData.length === 1) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginTop: "1rem",
          backgroundColor: "#f9f9f9"
        }}>
          <img 
            src={userIcon}
            alt="User icon" 
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "1rem"
            }}
          />
          <h2>{person.first_name} {person.last_name}</h2>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <p><strong>Company:</strong> {person.company_name}</p>
            <p><strong>Address:</strong> {person.address}, {person.city}, {person.state} {person.zip}</p>
            <p><strong>Phone:</strong> {person.phone1 || person.phone2 || 'N/A'}</p>
            <p><strong>Email:</strong> {person.email || 'N/A'}</p>
            <p><strong>Website:</strong> {person.web ? <a href={person.web} target="_blank" rel="noopener noreferrer">{person.web}</a> : 'N/A'}</p>
          </div>
        </div>
      );
    } else if (searchField === "company_name" && filteredData.length === 1) {
      return (
        <div style={{
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginTop: "1rem",
          backgroundColor: "#f9f9f9"
        }}>
          <h2 style={{ textAlign: "center" }}>{person.company_name}</h2>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "1rem"
          }}>
            <video 
              controls 
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                marginBottom: "1rem"
              }}
            >
              <source src={companyVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div style={{ textAlign: "center" }}>
              <p><strong>Contact:</strong> {person.first_name} {person.last_name}</p>
              <p><strong>Address:</strong> {person.address}, {person.city}, {person.state} {person.zip}</p>
              <p><strong>Phone:</strong> {person.phone1 || person.phone2 || 'N/A'}</p>
              <p><strong>Email:</strong> {person.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>neARabl Project</h1>
        <p>Please wait ...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#2A2D77" }}>neARabl Project</h1>

      {error && (
        <div style={{
          padding: "1rem",
          margin: "1rem 0",
          backgroundColor: "#ffebee",
          borderLeft: "4px solid #f44336",
          color: "#d32f2f"
        }}>
          <strong>Note:</strong> {error}. {usingFallback ? "Using fallback data instead." : ""}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setShowVisualSummary((prev) => !prev)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          {showVisualSummary ? "Hide Visual Summaries" : "Show Visual Summaries"}
        </button>

        <button
          onClick={() => setShowSummary((prev) => !prev)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#e32636",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {showSummary ? "Hide Summaries" : "Show Summaries"}
        </button>
      </div>

      {(showSummary || showVisualSummary) && (
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="summarySortField" style={{ marginRight: "0.5rem" }}>Sort summary by:</label>
          <select
            id="summarySortField"
            value={summarySortField}
            onChange={(e) => setSummarySortField(e.target.value as "state" | "zip" | "county" | "city")}
            style={{ padding: "0.5rem" }}
          >
            <option value="state">State</option>
            <option value="zip">Zip</option>
            <option value="county">County</option>
            <option value="city">City</option>
          </select>
        </div>
      )}

      {showVisualSummary && Object.keys(stateSummary).length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            Distribution by {summarySortField.charAt(0).toUpperCase() + summarySortField.slice(1)}:
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {Object.entries(stateSummary)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => {
                const max = Math.max(...Object.values(stateSummary));
                const widthPercent = (count / max) * 100;

                return (
                  <div key={key} style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: "100px", fontSize: "0.9rem" }}>{key}</span>
                    <div style={{
                      height: "20px",
                      width: `${widthPercent}%`,
                      backgroundColor: "#2A2D77",
                      borderRadius: "4px",
                      marginLeft: "0.5rem",
                      color: "white",
                      padding: "0 6px",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center"
                    }}>
                      {count}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {showSummary && Object.keys(stateSummary).length > 0 && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#f0f8ff",
          border: "1px solid #ccc",
          borderRadius: "8px"
        }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            People per {summarySortField.charAt(0).toUpperCase() + summarySortField.slice(1)}:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {Object.entries(stateSummary)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([label, count]) => (
                <div key={label} style={{
                  backgroundColor: "#e6f0ff",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px"
                }}>
                  <strong>{label}</strong>: {count}
                </div>
              ))}
          </div>
        </div>
      )}

      <div style={{ margin: "1.5rem 0", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div>
          <label htmlFor="searchField" style={{ marginRight: "0.5rem" }}>
            Search by:
          </label>
          <select
            id="searchField"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as keyof Person)}
            style={{ padding: "0.5rem" }}
          >
            {data[0] && Object.keys(data[0]).map((key) => (
              <option key={key} value={key}>
                {key.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder={`Search ${searchField.replace(/_/g, " ")}...`}
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          style={{ padding: "0.5rem", flex: "1", minWidth: "200px" }}
        />

        <div style={{ color: "#666" }}>
          Showing {filteredData.length} of {data.length} records
          {usingFallback && " (using fallback data)"}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          No matching records found
        </div>
      ) : (
        <>
          {filteredData.length === 1 && renderSingleResult(filteredData[0])}
          
          {(filteredData.length !== 1 || 
            (searchField !== "first_name" && searchField !== "company_name")) && (
            <div style={{ overflowX: "auto", marginTop: "1rem" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#007BFF", color: "#fff" }}>
                    {data[0] && Object.keys(data[0]).map((key) => (
                      <th 
                        key={key}
                        style={{
                          padding: "12px 15px",
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                          position: "sticky",
                          top: 0,
                          backgroundColor: "#007BFF",
                          color: "#fff"
                        }}
                      >
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((person, index) => (
                    <tr 
                      key={index}
                      style={{
                        borderBottom: "1px solid #ddd",
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9"
                      }}
                    >
                      {Object.values(person).map((value, i) => (
                        <td 
                          key={i}
                          style={{
                            padding: "12px 15px",
                            whiteSpace: "nowrap",
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {value || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;