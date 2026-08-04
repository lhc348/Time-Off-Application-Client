import url from "./url";

export const getOfficer = async () => {
  const response = await fetch(url.OFFICER);
  if (!response.ok) throw new Error(response.statusText);

  return await response.json();
};

export const listActingApprovers = async () => {
  const response = await fetch(url.ACTING_APPROVER);
  if (!response.ok) throw new Error(response.statusText);

  return await response.json();
};

export const listApplications = async () => {
  const response = await fetch(url.APPLICATION);
  if (!response.ok) throw new Error(response.statusText);

  return await response.json();
};

export const applyTimeOff = async (application, actingApproverCorpId) => {
  const response = await fetch(url.APPLY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      application,
      actingApproverCorpId
    })
  });
  if (!response.ok) throw new Error(response.statusText);

  return await response.json();
};

export const updateTimeOff = async (application, actingApproverCorpId) => {
  const response = await fetch(`${url.APPLY}/${application.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      application,
      actingApproverCorpId
    })
  });
  if (!response.ok) throw new Error(response.statusText);

  return await response.json();
};

export const withdrawApplication = async id => {
  const response = await fetch(`${url.APPLICATION}/${id}/withdrawn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) throw new Error(response.statusText);

  return await response.json();
};
