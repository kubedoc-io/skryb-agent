/* 
a8r.io/description
Unstructured text description of the service for humans.
a8r.io/owner
GitHub or equivalent username (prefix with @), email address, or unstructured owner description.
a8r.io/chat
Slack channel (prefix with #), or link to other external chat system.
a8r.io/bugs
Link to external bug tracker.
a8r.io/logs
Link to external log viewer.
a8r.io/documentation
Link to external project documentation.
a8r.io/repository
Link to external VCS repository.
a8r.io/support
Link to external support center.
a8r.io/runbook
Link to external project runbook.
a8r.io/incidents
Link to external incident dashboard.
a8r.io/uptime
Link to external uptime dashboard.
a8r.io/performance
Link to external performance dashboard.
a8r.io/dependencies
*/
export function extractServiceInfos(service, model) {
  const mutations = [];

  const target = {
    name: service.metadata.name
  };

  mutations.push({ type: "SET_MICROSERVICE", data: target });
  return mutations;
}
