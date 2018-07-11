import React, {Component} from "react";
import {translate} from "react-i18next";

import "./DrawerValidation.css";

/**
 * The CodeEditor is responsible for handling violation of the rules set out for a given
 * programming challenge. A list of errors is passed in as a prop - this component is 
 * responsible for creating a readable sentence form of what is wrong with the student's code.
 * For example, "Your HTML code is missing an <h1> tag". The format of this language is stored in
 * the database as "Your {{p1}} is missing {{p2}}." (Note that this need be translated by lang)
 */
class DrawerValidation extends Component {

  getErrorForRule(rule) {
    const thisRule = this.props.errors.find(r => r.type === rule.type);
    if (!rule.passing && thisRule && thisRule.error_msg) {
      const param1 = rule.needle;
      let param2 = null;
      if (rule.property !== undefined) param2 = rule.property;
      if (rule.outer !== undefined) param2 = rule.outer;
      if (rule.attribute !== undefined) param2 = rule.attribute;
      if (rule.argType !== undefined) param2 = rule.argType;
      if (rule.varType !== undefined) param2 = rule.varType;
      const param3 = rule.value;
      let message;
      if (param3) {
        message = thisRule.error_msg_3.replace("{{p1}}", param1).replace("{{p2}}", param2).replace("{{p3}}", param3);
      }
      else if (param2) {
        message = thisRule.error_msg_2.replace("{{p1}}", param1).replace("{{p2}}", param2);
      }
      else message = thisRule.error_msg.replace("{{p1}}", param1);
      return <span className="error-text">{ message }</span>;
    }
    else {
      return null;
    }
  }

  render() {

    const {rules, t} = this.props;

    const ruleNames = {
      CONTAINS: t("rule.exists"),
      CSS_CONTAINS: t("rule.css"),
      CONTAINS_ONE: t("rule.unique"),
      CONTAINS_SELF_CLOSE: t("rule.exists"),
      NESTS: t("rule.nests"),
      JS_VAR_EQUALS: t("rule.equals"),
      JS_FUNC_EQUALS: t("rule.invokes"),
      JS_MATCHES: t("rule.contains"),
      JS_USES: t("rule.implements")
    };

    const sortedRules = rules.sort((a, b) => {
      const n = a.needle.localeCompare(b.needle);
      if (n !== 0) return n;
      return ruleNames[a.type].localeCompare(ruleNames[b.type]);
    });

    return <div id="DrawerValidation" className="contents">
      <table>
        <tbody>
          { sortedRules.map((rule, i) => {
            const first = i === rules.indexOf(rules.find(r => r.needle === rule.needle));
            // for a given "needle" in a "haystack", group the rules underneath ONE needle.
            // This is so things can be built like:
            // h1:  not included
            //      not nested inside body
            //      needs styling
            const family = sortedRules.filter(r => r.needle === rule.needle);
            const passing = 0;
            // const passing = family.filter(rule => rule.passing).length;
            return <tr className={ first ? "first" : "" } key={i}>
              { first
                ? <td className="needle" rowSpan={ family.length } colSpan={ passing === family.length ? "2" : "1" }>
                  { passing === family.length
                    ? <span className="pt-icon-standard pt-icon-endorsed pt-intent-success"></span>
                    : null}
                  {rule.needle}
                  { passing === family.length
                    ? <div className="allpassing">

                      {t("All Rules Passing")}
                    </div>
                    : null }
                </td> : null }
              { passing !== family.length
                ? <td className={ rule.passing ? "rule complete" : "rule error" }>
                  <span className={ `pt-icon-standard ${rule.passing ? "pt-icon-endorsed pt-intent-success" : "pt-icon-error pt-intent-danger"}` }></span>
                  <span className="rule-name">{ruleNames[rule.type]}{ this.getErrorForRule(rule) }</span>
                </td>
                : null
              }
            </tr>;
          })}
        </tbody>
      </table>
    </div>;
  }

}

DrawerValidation.defaultProps = {
  errors: [],
  rules: []
};

export default translate()(DrawerValidation);
