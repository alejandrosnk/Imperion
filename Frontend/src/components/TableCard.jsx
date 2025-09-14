import React from "react";
import "../styles/tables.css";

function TableCard({ table, onSelect, onFree }) {
  // Clases CSS por estado
  const statusColors = {
    FREE: "free",
    OCCUPIED: "occupied",
    CLEANING: "cleaning"
  };

  const handleClick = () => {
    if (table.status === "CLEANING") {
      onFree(table); // liberar mesa
    } else {
      onSelect(table); // flujo normal: asignar pedido o ver detalle
    }
  };

  return (
    <div
      className={`table-card ${statusColors[table.status]}`}
      onClick={handleClick}
    >
      {table.status === "CLEANING" ? (
        <i className="fa-solid fa-feather-pointed fa-2x mb-2"></i>
      ) : (
        <i className="fa-solid fa-utensils fa-2x mb-2"></i>
      )}
      <h5>{table.code}</h5>
    </div>
  );
}

export default TableCard;
