import React, { useState } from "react";
import filtersIcon from "../../assets/images/001-edit 1.svg";
import downarrow from "../../assets/images/downarrow.svg";
import uparrow from "../../assets/images/uparrow.svg";
const TabView = ({
  filters,
  setFilters,
  handleResetAll,
  handleDateFilter,
  selectedDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  handleSourceTypeChange,
  handleArticleTypeFilter,
  toggleFilters,
  showFilters,
  handleSubjectAreaFilter
}) => {
  const [showArticleType, setShowArticleType] = useState(true);
  const [showSubjectArea, setShowSubjectArea] = useState(true);
  const [showBiorxiv, setShowBiorxiv] = useState(true);
  const [showPlos, setShowPlos] = useState(true);
  const [showPubmed, setShowPubmed] = useState(true);
  const [showBiorxivType, setShowBiorxivType] = useState(true);
  const [showSourceType, setShowSourceType] = useState(true);
  const [showPublicationDate, setShowPublicationDate] = useState(true);
  return (
    <>
      <div className="SearchOptions-ViewChange">
        <div className="SearchResult-Count-Filters-ViewChange">
          {/* Toggle Filter Button */}
          <div className="filters-container-ViewChange">
            <button
              className="toggle-filters-button-ViewChange"
              onClick={toggleFilters}
            >
              <img src={filtersIcon} alt="filter-icon" />
            </button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="search-filters-container-ViewChange tabletview">
              <div className="searchContent-left-header">
                <p className="title">Filters</p>
                <p className="Filters-ResetAll" onClick={handleResetAll}>
                  Reset All
                </p>
              </div>
              <div className="filters-content-ViewChange">
                {/* Subject Area Section */}
                <div className="filter-group-ViewChange tabletView">
                  <h4>Subject Area</h4>
                  <div className="subFilters" style={{ marginLeft: "0" }}>
                    {showSubjectArea && (
                      <>
                        <div className="biorxiv-filters">
                          <h6 onClick={() => setShowBiorxiv(!showBiorxiv)}>
                            Biorxiv{" "}
                            {showBiorxiv ? (
                              <img src={downarrow} alt="down-arrow" />
                            ) : (
                              <img src={uparrow} alt="up-arrow" />
                            )}
                          </h6>
                          {showBiorxiv && (
                              <div className="biorxiv-options-dropdown">
                              <label>
                                <input
                                  type="checkbox"
                                  value="addiction medicine"
                                  checked={filters.subjectArea?.includes("addiction medicine")}
                                  onChange={handleSubjectAreaFilter}
                                />{" "}
                                Addiction Medicine
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  value="anesthesia"
                                  checked={filters.subjectArea?.includes("anesthesia")}
                                  onChange={handleSubjectAreaFilter}
                                />{" "}
                                Anesthesia
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  value="dermatology"
                                  checked={filters.subjectArea?.includes("dermatology")}
                                  onChange={handleSubjectAreaFilter}
                                />{" "}
                                dermatology
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  value="epidemiology"
                                  checked={filters.subjectArea?.includes("epidemiology")}
                                  onChange={handleSubjectAreaFilter}
                                />{" "}
                                Epidemiology
                              </label>
                            </div>
                          )}
                        </div>
                        <div className="plos-filters">
                          <h6 onClick={() => setShowPlos(!showPlos)}>
                            PLOS{" "}
                            {showPlos ? (
                              <img src={downarrow} alt="down-arrow" />
                            ) : (
                              <img src={uparrow} alt="up-arrow" />
                            )}
                          </h6>

                          {showPlos && (
                           <div className="plos-options-dropdown">
                           <label><input type="checkbox" value="nutrition" checked={filters.subjectArea?.includes("nutrition")}
                   onChange={handleSubjectAreaFilter} />Nutrition</label>
                           <label><input type="checkbox" value="physiology" checked={filters.subjectArea?.includes("physiology")}
                   onChange={handleSubjectAreaFilter}/> Physiology</label>
                           <label><input type="checkbox" value="biochemistry"checked={filters.subjectArea?.includes("biochemistry")}
                   onChange={handleSubjectAreaFilter} /> Biochemistry</label>
                           <label><input type="checkbox" value="anatomy" checked={filters.subjectArea?.includes("anatomy")}
                   onChange={handleSubjectAreaFilter}/> Anatomy</label>
                       </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Article Type Section */}
                <div className="filter-group-ViewChange">
                  <h4>Article Type</h4>
                  <div className="subFilters" style={{ marginLeft: "0" }}>
                    {showArticleType && (
                      <>
                        <div className="biorxiv-filters">
                          <h6
                            onClick={() => setShowBiorxivType(!showBiorxivType)}
                          >
                            Biorxiv{" "}
                            {showBiorxivType ? (
                              <img src={downarrow} alt="down-arrow" />
                            ) : (
                              <img src={uparrow} alt="up-arrow" />
                            )}
                          </h6>

                          {showBiorxivType && (
                            <div className="biorxiv-options-dropdown">
                            <label><input type="checkbox" value="research article" checked={filters.articleType?.includes("research article")} onChange={handleArticleTypeFilter} /> research article</label>
                            <label><input type="checkbox" value="correction" checked={filters.articleType?.includes("correction")} onChange={handleArticleTypeFilter} />correction</label>
                            <label><input type="checkbox" value="study protocol" checked={filters.articleType?.includes("study protocol")} onChange={handleArticleTypeFilter} /> study protocol</label>
                            <label><input type="checkbox" value="lab protocol" checked={filters.articleType?.includes("lab protocol")} onChange={handleArticleTypeFilter} /> lab protocol</label>
                          </div>
                          )}
                        </div>
                        <div className="pubmed-filters">
                          <h6 onClick={() => setShowPubmed(!showPubmed)}>
                            Pubmed{" "}
                            {showPubmed ? (
                              <img src={downarrow} alt="down-arrow" />
                            ) : (
                              <img src={uparrow} alt="up-arrow" />
                            )}
                          </h6>
                          {showPubmed && (
                            <div className="pubmed-options-dropdown">
                            <label><input type="checkbox" value="Adaptive Clinical Trial" checked={filters.articleType?.includes("Adaptive Clinical Trial")} onChange={handleArticleTypeFilter} /> Adaptive Clinical Trial</label>
                          <label><input type="checkbox" value="Clinical Study" checked={filters.articleType?.includes("Clinical Study")} onChange={handleArticleTypeFilter} /> Clinical Study</label>
                          <label><input type="checkbox" value="Observational Study" checked={filters.articleType?.includes("Observational Study")} onChange={handleArticleTypeFilter} /> Observational Study</label>
                          <label><input type="checkbox" value="Comparative Study" checked={filters.articleType?.includes("Comparative Study")} onChange={handleArticleTypeFilter} /> Comparative Study</label>
                        </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="filter-group-ViewChange">
                  <h4>Publication Date </h4>
                  <div
                    className="subFilters"
                    style={{ marginLeft: "0", marginTop: "15px" }}
                  >
                    {showPublicationDate && (
                      <div
                        className="searchfilter-options-dropdown"
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <label>
                          <input
                            type="radio"
                            name="date"
                            value="1"
                            checked={selectedDateRange === "1"}
                            onChange={() => handleDateFilter("1")}
                          />{" "}
                          1 year
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="date"
                            value="5"
                            checked={selectedDateRange === "5"}
                            onChange={() => handleDateFilter("5")}
                          />{" "}
                          5 years
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="date"
                            value="custom"
                            checked={selectedDateRange === "custom"}
                            onChange={() => handleDateFilter("custom")}
                          />{" "}
                          Custom range
                        </label>
                        {selectedDateRange === "custom" && (
                          <div className="custom-date-range custom-date-input">
                            <label>
                              Start Date:
                              <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) =>
                                  setCustomStartDate(e.target.value)
                                }
                              />
                            </label>
                            <label>
                              End Date:
                              <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) =>
                                  setCustomEndDate(e.target.value)
                                }
                              />
                            </label>
                            <button
                              className="ApplyFilters"
                              onClick={() =>
                                handleDateFilter(
                                  "custom",
                                  customStartDate,
                                  customEndDate
                                )
                              }
                            >
                              Apply
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TabView;
