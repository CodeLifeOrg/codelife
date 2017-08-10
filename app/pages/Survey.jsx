import React, {Component} from "react";
import axios from "axios";
import {translate} from "react-i18next";
import {RadioGroup, Radio, Intent, Position, Toaster} from "@blueprintjs/core";
import Loading from "components/Loading";

class Survey extends Component {

  constructor(props) {

    super(props);
    this.state = {
      error: null,
      loading: true,
      q0: null,
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      q5: null,
      q6: null
    };
  }

  /**
   * Grabs username from URL param, makes AJAX call to server and sets error
   * state (if no user is found) or overrides state (if one is).
   */
  componentWillMount() {
    axios.get("/api/survey/")
      .then(surveyResp => {
        const surveyData = surveyResp.data;
        console.log(surveyData);
        if (surveyData.error) {
          this.setState({loading: false, error: surveyData.error});
        }
        else {
          this.setState({
            error: false,
            loading: false,
            ...surveyData
          });
        }
      })
      .catch(() => {
        this.setState({
          error: "You need to be logged in to take the survey!",
          loading: false
        });
      });
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  submit() {
    console.log("submitting:", this.state);
    axios.post("/api/survey/", {survey: this.state}).then(resp => {
      const responseData = resp.data;
      const t = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
      t.show({message: "Survey saved!", intent: Intent.SUCCESS});
    });
  }

  render() {
    const {t} = this.props;
    const {error, loading, q0, q1, q2, q3, q4, q5, q6} = this.state;
    const handleChange = this.handleChange.bind(this);
    const submit = this.submit.bind(this);

    if (loading) return <Loading />;
    if (error) return <h1>{error}</h1>;

    return (
      <div id="about-container">
        <h1>{ t("Survey") }</h1>

        <RadioGroup
          className="pt-form-group"
          label={ t("How likely are you to revisit the site?") }
          onChange={handleChange}
          selectedValue={q0}
          name="q0"
        >
          <Radio label={ t("Very likely") } value="0" />
          <Radio label={ t("Somewhat likely") } value="1" />
          <Radio label={ t("Somewhat unlikely") } value="2" />
          <Radio label={ t("Very unlikely") } value="3" />
          <Radio label={ t("Not sure") } value="4" />
        </RadioGroup>

        <RadioGroup
          className="pt-form-group"
          label={ t("How likely are you to tell a friend or classmate about CodeLife?") }
          onChange={handleChange}
          selectedValue={q1}
          name="q1"
        >
          <Radio label={ t("Very likely") } value="0" />
          <Radio label={ t("Somewhat likely") } value="1" />
          <Radio label={ t("Somewhat unlikely") } value="2" />
          <Radio label={ t("Very unlikely") } value="3" />
          <Radio label={ t("Not sure") } value="4" />
        </RadioGroup>

        <RadioGroup
          className="pt-form-group"
          label={ t("How difficult was the material you learned in CodeLife?") }
          onChange={handleChange}
          selectedValue={q2}
          name="q2"
        >
          <Radio label={ t("Very difficult") } value="0" />
          <Radio label={ t("Somewhat difficult") } value="1" />
          <Radio label={ t("Somewhat easy") } value="2" />
          <Radio label={ t("Very easy") } value="3" />
          <Radio label={ t("Not sure") } value="4" />
        </RadioGroup>

        <div className="pt-form-group">
          <label className="pt-label" htmlFor="example-form-group-input-a">
            { t("What was the thing you struggled with the most from today's exercise?") }
          </label>
          <div className="pt-form-content">
            <textarea rows="4" className="pt-input" dir="auto" name="q3" onChange={handleChange}  value={q3 || ""}></textarea>
            <div className="pt-form-helper-text">{ t("Please be as detailed as possible with your feedback") }</div>
          </div>
        </div>

        <div className="pt-form-group">
          <label className="pt-label" htmlFor="example-form-group-input-a">
            { t("What was the thing you enjoyed the most from today's exercise?") }
          </label>
          <div className="pt-form-content">
            <textarea rows="4" className="pt-input" dir="auto" name="q4" onChange={handleChange} value={q4 || ""}></textarea>
            <div className="pt-form-helper-text">{ t("Please be as detailed as possible with your feedback") }</div>
          </div>
        </div>

        <RadioGroup
          className="pt-form-group"
          label={ t("What part of the site did you enjoy the most?") }
          onChange={handleChange}
          selectedValue={q5}
          name="q5"
        >
          <Radio label={ t("Islands (lessons)") } value="0" />
          <Radio label={ t("Projects (build your own site)") } value="1" />
          <Radio label={ t("Customizing my profile") } value="2" />
          <Radio label={ t("None of it") } value="3" />
        </RadioGroup>

        <RadioGroup
          className="pt-form-group"
          label={ t("How much does the potential of receiving a \"CodeLife degree\" motivate you to complete the site?") }
          onChange={handleChange}
          selectedValue={q6}
          name="q6"
        >
          <Radio label={ t("Very motivated") } value="0" />
          <Radio label={ t("Somewhat motivated") } value="1" />
          <Radio label={ t("Not very motivated") } value="2" />
          <Radio label={ t("Not motivated at all") } value="3" />
          <Radio label={ t("Not sure") } value="4" />
        </RadioGroup>

        <button type="button" className="pt-button pt-fill pt-intent-success" onClick={submit}>
          { t("Submit Survey") }
          <span className="pt-icon-standard pt-icon-arrow-right pt-align-right"></span>
        </button>
      </div>
    );
  }
}

export default translate()(Survey);
