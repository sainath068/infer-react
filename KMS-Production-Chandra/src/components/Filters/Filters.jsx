import React, { useState, useEffect } from "react";
import downarrow from "../../assets/images/downarrow.svg";
import uparrow from "../../assets/images/uparrow.svg";
import "./Filters.css";

const FiltersSection = ({ filters, setFilters, handleResetAll, handleDateFilter, selectedDateRange,setSelectedDateRange, customStartDate, setCustomStartDate,handleSubjectAreaFilter, customEndDate, setCustomEndDate, handleSourceTypeChange, handleArticleTypeFilter }) => {
  const [showArticleType, setShowArticleType] = useState(true);
  const [showSubjectArea, setShowSubjectArea] = useState(true);
  const [showBiorxiv, setShowBiorxiv] = useState(true);
  const [showPlos, setShowPlos] = useState(true);
  const [showPubmed, setShowPubmed] = useState(true);
  const[showBiorxivType, setShowBiorxivType] = useState(true);
  const [showSourceType, setShowSourceType] = useState(true);
  const [showPublicationDate, setShowPublicationDate] = useState(true);
  

  return (
    <div className="searchContent-left">
      <div className="searchContent-left-header">
        <p className="title">Filters</p>
        <p className="Filters-ResetAll" onClick={handleResetAll}>Reset All</p>
      </div>

      <div className="searchfilter-options">
        {/* Subject Area Section */}
        <div className="subject-area-search">
          <h5 onClick={() => setShowSubjectArea(!showSubjectArea)}>
            Subject Area {showSubjectArea ? <img src={downarrow} alt="down-arrow" /> : <img src={uparrow} alt="up-arrow" />}
          </h5>
            <div className="subFilters">
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
        <div className="searchfilter-section">
          <h5 onClick={() => setShowArticleType(!showArticleType)}>
            Article Type {showArticleType ? <img src={downarrow} alt="down-arrow" /> : <img src={uparrow} alt="up-arrow" />}
          </h5>
          <div className="subFilters">
            {showArticleType && (
            <>
            <div className="biorxiv-type-filters">
            <h6 onClick={() => setShowBiorxivType(!showBiorxivType)}>
                PLOS{" "}
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

          {/* {showArticleType && (
            <div className="searchfilter-options-dropdown">
              <label><input type="checkbox" value="Books and Documents" checked={filters.articleType?.includes("Books and Documents")} onChange={handleArticleTypeFilter} /> Books and Documents</label>
              <label><input type="checkbox" value="Clinical Trials" checked={filters.articleType?.includes("Clinical Trials")} onChange={handleArticleTypeFilter} /> Clinical Trials</label>
              <label><input type="checkbox" value="Meta Analysis" checked={filters.articleType?.includes("Meta Analysis")} onChange={handleArticleTypeFilter} /> Meta Analysis</label>
              <label><input type="checkbox" value="Review" checked={filters.articleType?.includes("Review")} onChange={handleArticleTypeFilter} /> Review</label>
            </div>
          )} */}
        </div>

        {/* Source Type Section */}
        {/* <div className="searchfilter-section">
          <h5 onClick={() => setShowSourceType(!showSourceType)}>
            Source Type {showSourceType ? <img src={downarrow} alt="down-arrow" /> : <img src={uparrow} alt="up-arrow" />}
          </h5>
          
          {showSourceType && (
            <div className="searchfilter-options-dropdown">
              <label><input type="checkbox" value="MedRxiv" checked={filters.sourceType?.includes("MedRxiv")} onChange={handleSourceTypeChange} /> MedRxiv</label>
              <label><input type="checkbox" value="Public Library of Science (PLOS)" checked={filters.sourceType?.includes("Public Library of Science (PLOS)")} onChange={handleSourceTypeChange} /> PLOS</label>
              <label><input type="checkbox" value="pubmed" checked={filters.sourceType?.includes("pubmed")} onChange={handleSourceTypeChange} /> PubMed</label>
            </div>
          )}
        </div> */}

        {/* Publication Date Section */}
        <div className="searchfilter-section">
  <h5 onClick={() => setShowPublicationDate(!showPublicationDate)}>
    Publication Date{" "}
    {showPublicationDate ? (
      <img src={downarrow} alt="down-arrow" />
    ) : (
      <img src={uparrow} alt="up-arrow" />
    )}
  </h5>

  {showPublicationDate && (
    <div className="searchfilter-options-dropdown">
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
          onChange={() => {
            setSelectedDateRange("custom");
            setFilters((prev) => ({
              ...prev,
              dateRange: "custom",
              customStartDate,
              customEndDate,
            }));
          }}
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
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </label>
          <button
            className="ApplyFilters"
            disabled={!customStartDate || !customEndDate}
            onClick={() =>
              handleDateFilter("custom", customStartDate, customEndDate)
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
  );
};

export default FiltersSection;
