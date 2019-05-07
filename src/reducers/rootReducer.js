import routes from "../services/routes.jsx";
import {
  TOGGLE_ALIGNMENTS_COLLAPSED,
  RELOAD_RESULTS,
  SCROLL_RESULTS,
  SORT_RESULTS,
  SUBMIT_JOB,
  FETCH_RESULTS,
  FETCH_RNACENTRAL_DATABASES
} from "../actions/actionTypes";
import initialState from "../store/initialState";


onSubmit = function (event) {
  event.preventDefault();

  // if sequence is not given - ignore submit
  if (this.state.sequence) {
    fetch(routes.submitJob(), {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: this.state.sequence,
        databases: Object.keys(this.state.selectedDatabases).filter(key => this.state.selectedDatabases[key])
      })
    })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(data => this.setState({jobId: data.job_id}))
    .catch(error => this.setState({status: error, submissionError: response.statusText}));
  }
};


/**
 * Is called when user tries to reload the facets data after an error.
 */
onReload = function () {
  this.load(this.props.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
};

/**
 * Is called when user selects a different sorting order.
 */
onSort = function (event) {
  let ordering = event.target.value;
  this.setState({ ordering: ordering }, () => {
    this.load(this.props.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
  });
};

/**
 * Collapses/displays alignments in search results
 */
onToggleAlignmentsCollapsed = function () {
  $('.alignment').toggleClass('alignment-collapsed');
  this.setState({ alignmentsCollapsed: !this.state.alignmentsCollapsed });
};

/**
 * Checks that the page was scrolled down to the bottom.
 * Load more entries, if available then.
 *
 * Mostly stolen from: https://alligator.io/react/react-infinite-scroll/
 * Cross-browser compatibility: https://codingrepo.com/javascript/2015/10/10/javascript-infinite-scroll-with-cross-browser/
 */
onScroll = function () {
  let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  let scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

  // Checks that the page has scrolled to the bottom
  if (windowHeight + scrollPosition + 10 >= document.documentElement.offsetHeight) {
    if (this.state.status === "success" && this.state.entries.length < this.state.hitCount) {
      this.setState(
        (state, props) => (state.start === this.state.start ? { start: this.state.start + this.state.size, status: "loading" } : { status: "loading" }),
        () => {
          let query = this.buildQuery();
          this.load(this.props.resultId, query, this.state.start, this.state.size, this.state.ordering, false, false);
        }
      );
    }
  }
};


const rootReducer = function (state = initialState, action) {
  let newState;

  switch (action.type) {
    case TOGGLE_ALIGNMENTS_COLLAPSED:
      return action;

    case RELOAD_RESULTS:
      newState = action.stuff;
      return newState;

    case SCROLL_RESULTS:
      return newState;

    case SORT_RESULTS:
      return newState;

    case SUBMIT_JOB:
      return newState;

    case FETCH_RESULTS:
      return newState;

    case FETCH_RNACENTRAL_DATABASES:
      if (action.status === 'success') {
        let data = action.data;

        let rnacentralDatabases = data.map(database => database.id);

        let selectedDatabases = {};
        data.map(database => { selectedDatabases[database.id] = false });

        let rnacentralDatabaseLabels = {};
        data.map(database => { rnacentralDatabaseLabels[database.id] =  database.label });

        Object.assign({}, newState, {
          rnacentralDatabases: rnacentralDatabases,
          selectedDatabases: selectedDatabases,
          rnacentralDatabaseLabels: rnacentralDatabaseLabels,
          rnacentralDatabasesError: false
        });

      } else if (action.status === 'error') {
        Object.assign({}, newState, {
          rnacentralDatabases: [],
          selectedDatabases: {},
          rnacentralDatabaseLabels: {},
          rnacentralDatabasesError: true
        });
      }

      return newState;

    default:
      return state;
  }
};

export default rootReducer;