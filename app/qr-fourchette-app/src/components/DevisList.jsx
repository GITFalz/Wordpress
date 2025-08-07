import React from 'react';

export default function DevisList({ devisList }) {
  if (!devisList.length) return <p>No devis found.</p>;

  return (
    <ul>
      {devisList.map((devis) => (
        <li key={devis.id}>
          {devis.step_name} (Step {devis.step_index})
        </li>
      ))}
    </ul>
  );
}