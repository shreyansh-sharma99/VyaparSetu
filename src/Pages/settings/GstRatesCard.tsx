import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import { toast } from "react-toastify";
import ComponentCard from "@/components/common/ComponentCard";
import { getGstRates, updateGstRates } from "./services/settingsService";

/**
 * Master → Settings → GST Rates: the GST % list every shop can choose from
 * (product form, GST master, import). Type a rate, press Enter, then Save.
 * Removing a rate does not change products already on it — they keep it.
 */
const GstRatesCard: React.FC = () => {
  const [saved, setSaved] = useState<number[]>([]);
  const [rates, setRates] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getGstRates()
      .then((res) => {
        if (!alive) return;
        const list: number[] = (res?.data?.rates || []).map(Number);
        setSaved(list);
        setRates(list);
      })
      .catch(() => alive && toast.error("Could not load the GST rates"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const addRate = () => {
    const text = input.trim().replace(/%$/, "").trim();
    if (!text) return;
    const n = Number(text);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      setError("Enter a GST rate from 0 to 100");
      return;
    }
    if (Math.round(n * 100) / 100 !== n) {
      setError("Use at most 2 decimals");
      return;
    }
    if (rates.includes(n)) {
      setError(`${n} % is already in the list`);
      return;
    }
    setRates([...rates, n].sort((a, b) => a - b));
    setInput("");
    setError("");
  };

  const removeRate = (n: number) => setRates(rates.filter((r) => r !== n));

  const changed = rates.length !== saved.length || rates.some((r, i) => r !== saved[i]);

  const save = async () => {
    if (!rates.length) {
      setError("Add at least one GST rate");
      return;
    }
    setSaving(true);
    try {
      const res = await updateGstRates(rates);
      const list: number[] = (res?.data?.rates || rates).map(Number);
      setSaved(list);
      setRates(list);
      toast.success(res?.message || "GST rates saved");
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Could not save the GST rates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ComponentCard
      title="GST Rates"
      loading={loading}
      className="shadow-sm border-gray-100 dark:border-gray-800"
      rightButtonNode={
        <button
          onClick={save}
          disabled={!changed || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      }
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        The GST % rates every shop can choose for its products. Type a rate and press Enter. Products already on a removed rate keep it.
      </p>
      <div className="flex gap-2 max-w-sm">
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={input}
          placeholder="e.g. 5"
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addRate();
            }
          }}
          className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-800 dark:text-white/90 outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addRate}
          className="h-10 px-4 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {rates.length === 0 && !loading && <span className="text-sm text-gray-400">No GST rates yet.</span>}
        {rates.map((r) => (
          <Tag key={r} color="blue" closable onClose={(e) => { e.preventDefault(); removeRate(r); }} className="!text-sm !px-2.5 !py-1 !m-0">
            {r} %
          </Tag>
        ))}
      </div>
      {changed && <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">Not saved yet — press Save.</p>}
    </ComponentCard>
  );
};

export default GstRatesCard;
