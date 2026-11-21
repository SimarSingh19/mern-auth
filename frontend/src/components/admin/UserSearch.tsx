import { useEffect, useState } from "react";

export type UserFilters = {
  name: string;
  age: string;
};

type Props = {
  onSearch: (filters: UserFilters) => void;
};

export default function UserSearch({ onSearch }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({
        name: name.trim().toLowerCase(),
        age: age.trim(),
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [name, age, onSearch]);

  function clearSearch() {
    setName("");
    setAge("");
    onSearch({ name: "", age: "" });
  }

  return (
    <div className="user-search">
      <div className="user-search-field">
        <label htmlFor="nameSearch">Search by name</label>
        <input
          id="nameSearch"
          type="search"
          className="form-control"
          placeholder="Enter username"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="user-search-field user-search-age">
        <label htmlFor="ageSearch">Search by age</label>
        <input
          id="ageSearch"
          type="number"
          min={0}
          step={1}
          className="form-control"
          placeholder="Enter age"
          value={age}
          onChange={(event) => setAge(event.target.value)}
        />
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary"
        disabled={!name && !age}
        onClick={clearSearch}
      >
        Clear
      </button>
    </div>
  );
}