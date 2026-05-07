import { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../UI/table";
import { CrossIcon, DeleteIcon, Eyeicon, HistoryIcon, SearchIcon, ArrowDownIcon, ArrowUpIcon, EditIcon, InfoIcon } from "../../icons/icons";
import { useNavigate } from "react-router-dom";
import Button from "../UI/button/Button";
import Loader from "../UI/Loader";
import '../../index.css';
import Checkbox from "../form/input/Checkbox";
import { Pagination, Switch } from 'antd';

import { Loader2 } from "lucide-react";


interface ColumnConfig<T> {
    label: string;
    key: keyof T;
    value?: 'checked' | 'unChecked';
    button?: boolean;
    checkbox?: boolean;
    checkboxHeading?: string;
}

interface ReusableTableProps<T> {
    headers: ColumnConfig<T>[];
    rows: T[];
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (id: string) => void;
    onHistory?: (item: T) => void;
    showAddButton?: boolean;
    addButtonText?: string;
    addButtonPath?: string;
    loading?: boolean;
    error?: string | null;
    checkbox?: boolean;
    checkboxHeading?: string;
    Button1?: string;
    Button2?: string;
    ToggleName?: string;
    currentPage?: number;
    total?: number;
    pageSize?: number;
    buttonContainerClassName1?: string;
    buttonContainerClassName2?: string;
    onPageChange?: (page: number, pageSize?: number) => void;
    onPageSizeChange?: (size: number) => void;
    selectedRows?: { [key: string]: boolean };
    onSelectionChange?: (selectedRows: { [key: string]: boolean }) => void;
    onStatusClick?: (item: T, remarks: string) => void;
    searchQuery?: string;
    setSearchQuery?: (value: string) => void;
    onSearchSubmit?: () => void;
    implementLoading?: boolean;
    disableEditCondition?: (row: any) => boolean;
    disableViewCondition?: (row: any) => boolean;
    disableDeleteCondition?: (row: any) => boolean;
    iconColumnKey?: string;
    onIconClick?: (value: any, row: T) => void;
    implementError?: string | null;
    maxHeight?: string;
    IconComponent?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    disableAddButton?: boolean;
    onAdd?: () => void;
    onCheckbox?: boolean;
    onCheckboxToggle?: (row: T) => void;
    onActionButtonClick?: (row: T) => void;
    actionButtonName?: string;
    actionButtonHeader?: string;
    customActions?: (row: T) => React.ReactNode;
    onDownloadExcel?: () => void;
    onDownloadCSV?: () => void;
    onDownloadPDF?: () => void;
    isDownloadingExcel?: boolean;
    isDownloadingCSV?: boolean;
    isDownloadingPDF?: boolean;
}

const truncateWords = (text: string, limit: number) => {
    const words = text.trim().split(/\s+/);
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
};

export default function AdvanceTable<T extends Record<string, any>>({
    iconColumnKey,
    onIconClick,
    IconComponent,
    headers,
    rows,
    error,
    onView,
    onEdit,
    checkbox,
    checkboxHeading,
    onDelete,
    onHistory,
    maxHeight,
    // Button1,
    // Button2,
    showAddButton,
    // ToggleName,
    addButtonText,
    addButtonPath,
    searchQuery,
    setSearchQuery,
    loading,
    currentPage = 1,
    total = 0,
    pageSize = 10,
    onPageChange,
    // onPageSizeChange,
    selectedRows: propSelectedRows,
    onSelectionChange,
    onSearchSubmit,
    disableEditCondition,
    disableViewCondition,
    disableDeleteCondition,
    disableAddButton,
    onAdd,
    onCheckbox,
    onCheckboxToggle,
    onActionButtonClick,
    actionButtonName,
    actionButtonHeader,
    customActions,
    onDownloadExcel,
    onDownloadCSV,
    onDownloadPDF,
    isDownloadingExcel,
    isDownloadingCSV,
    isDownloadingPDF,
}: ReusableTableProps<T>) {

    const navigate = useNavigate();
    const [tempSearchInput, setTempSearchInput] = useState(searchQuery ?? "");
    useEffect(() => { setTempSearchInput(searchQuery ?? ""); }, [searchQuery]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({});
    const [localSelectedRows, setLocalSelectedRows] = useState<{ [key: string]: boolean }>({});

    const selectedRows = propSelectedRows !== undefined ? propSelectedRows : localSelectedRows;
    const setSelectedRows = onSelectionChange || setLocalSelectedRows;

    const toggleCellExpansion = (key: string) => {
        setExpandedCells((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const allOptions = headers.map((h) => ({
        label: h.label,
        value: h.key,
    }));

    const [selectedOptions, setSelectedOptions] = useState<{ label: string; value: any }[]>([]);

    useEffect(() => {
        const checkedHeaders = headers.filter((h) => h.value === 'checked');
        // If no header has value='checked', default to showing ALL columns
        const updatedSelected = checkedHeaders.length > 0
            ? checkedHeaders.map((h) => ({ label: h.label, value: h.key }))
            : headers.map((h) => ({ label: h.label, value: h.key }));
        setSelectedOptions(updatedSelected);
    }, [headers]);

    const visibleKeys = selectedOptions.map((opt) => opt.value);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // const handleCopyToClipboard = () => {
    //     // Get all visible data from the table
    //     const tableData = sortedRows.map(row => {
    //         const rowData: Record<string, any> = {};
    //         headers
    //             .filter(h => visibleKeys.includes(h.key))
    //             .forEach(header => {
    //                 rowData[header.label] = row[header.key];
    //             });
    //         return rowData;
    //     });

    //     // Convert to formatted text (you can adjust the format as needed)
    //     let textToCopy = '';

    //     // Add headers
    //     const headersText = headers
    //         .filter(h => visibleKeys.includes(h.key))
    //         .map(h => h.label)
    //         .join('\t');
    //     textToCopy += headersText + '\n';

    //     // Add rows
    //     tableData.forEach(row => {
    //         const rowText = headers
    //             .filter(h => visibleKeys.includes(h.key))
    //             .map(header => {
    //                 const value = row[header.label];
    //                 // Handle different data types and format appropriately
    //                 if (value === null || value === undefined) return '';
    //                 if (typeof value === 'object') return JSON.stringify(value);
    //                 return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
    //             })
    //             .join('\t');
    //         textToCopy += rowText + '\n';
    //     });

    //     navigator.clipboard.writeText(textToCopy).then(() => { toast.success('Table data copied to clipboard!'); })
    //         .catch(err => {
    //             console.error('Failed to copy: ', err);
    //             // Fallback for older browsers
    //             const textArea = document.createElement('textarea');
    //             textArea.value = textToCopy;
    //             document.body.appendChild(textArea);
    //             textArea.select();
    //             document.execCommand('copy');
    //             document.body.removeChild(textArea);
    //             toast.success('Table data copied to clipboard!');
    //         });
    // };



    // const handlePrint = () => {
    //     const tableColumn = headers
    //         .filter((h) => visibleKeys.includes(h.key))
    //         .map((h) => h.label);

    //     const tableRows = rows.map((row) =>
    //         headers
    //             .filter((h) => visibleKeys.includes(h.key))
    //             .map((h) => row[h.key])
    //     );

    //     const printWindow = window.open('', '', 'height=600,width=800');
    //     if (!printWindow) return;

    //     let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">';
    //     tableHTML += '<thead><tr>' + tableColumn.map(col => `<th style="padding: 8px;">${col}</th>`).join('') + '</tr></thead>';
    //     tableHTML += '<tbody>';
    //     tableRows.forEach(row => {
    //         tableHTML += '<tr>' + row.map(cell => `<td style="padding: 8px;">${cell}</td>`).join('') + '</tr>';
    //     });
    //     tableHTML += '</tbody></table>';

    //     printWindow.document.write(`
    //         <html>
    //           <head><title>Circulant Table PDF</title></head>
    //           <body>
    //             <h3>Table Data</h3>
    //             ${tableHTML}
    //             <script>
    //               window.onload = function() {
    //                 window.print();
    //                 window.onafterprint = function() { window.close(); };
    //               };
    //             </script>
    //           </body>
    //         </html>
    //     `);
    //     printWindow.document.close();
    // };





    const handleCheckboxChange = (id: string) => {
        const newSelectedRows = {
            ...selectedRows,
            [id]: !selectedRows[id],
        };
        setSelectedRows(newSelectedRows);
    };


    const handlePageChange = (page: number, size?: number) => {
        if (onPageChange) {
            onPageChange(page, size);
        }
    };


    const handleSearch = () => {
        const cleanedInput = tempSearchInput.trim().replace(/\s+/g, ' ');
        if (setSearchQuery) { setSearchQuery(cleanedInput); }
        onSearchSubmit?.();
    };

    const handleClear = () => {
        setTempSearchInput("");
        if (setSearchQuery) {
            setSearchQuery("");
        }
        onSearchSubmit?.();
    };

    const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc",
    });

    // 🔹 Handle header click
    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedRows = [...rows].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === "number" && typeof bVal === "number") {
            return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    return (
        <div className="w-full max-w-full overflow-hidden">


            {/* ── Toolbar ────────────────────────────────────────────── */}
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between flex-wrap">

                {/* Left side: column picker + action buttons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:flex-wrap">

                    {/* Column picker */}
                    {!error && (
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Columns</label>
                            <button
                                onClick={() => setDropdownOpen(prev => !prev)}
                                className="inline-flex items-center justify-between gap-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md text-sm w-full sm:w-44 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span>Columns ({selectedOptions.length}/{allOptions.length})</span>
                                <span className="text-gray-400">▾</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute scrollbar-hide z-50 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {allOptions.map(option => (
                                        <label
                                            key={option.value as string}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedOptions.some(opt => opt.value === option.value)}
                                                onChange={() => {
                                                    const alreadySelected = selectedOptions.some(opt => opt.value === option.value);
                                                    setSelectedOptions(prev =>
                                                        alreadySelected
                                                            ? prev.filter(opt => opt.value !== option.value)
                                                            : [...prev, option]
                                                    );
                                                }}
                                                className="h-4 w-4 rounded text-blue-600 border-gray-300"
                                            />
                                            <span className="text-gray-700 dark:text-gray-200">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-end gap-1.5">
                        {showAddButton && (
                            <Button size="sm" variant="primary" className="!py-2 !px-3 !rounded-md" onClick={onAdd ? onAdd : () => navigate(addButtonPath || "/")} disabled={disableAddButton}>
                                {addButtonText || "Add Item"}
                            </Button>
                        )}
                        {!error && (
                            <>
                                {/* <Button size="sm" variant="outline" className="!py-2 !px-3 !rounded-md" onClick={handleCopyToClipboard}>Copy</Button> */}
                                {onDownloadCSV && <Button size="sm" variant="outline" className="!py-2 !px-3 !rounded-md" onClick={onDownloadCSV} disabled={isDownloadingCSV}>
                                    {isDownloadingCSV ? <Loader2 className="w-4 h-4 animate-spin" /> : "CSV"}
                                </Button>}
                                {onDownloadExcel && (<Button size="sm" variant="outline" className="!py-2 !px-3 !rounded-md" onClick={onDownloadExcel} disabled={isDownloadingExcel}>
                                    {isDownloadingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excel"}
                                </Button>)}
                                {onDownloadPDF && (<Button size="sm" variant="outline" className="!py-2 !px-3 !rounded-md" onClick={onDownloadPDF} disabled={isDownloadingPDF}>
                                    {isDownloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : "PDF"}
                                </Button>)}
                                {/* <Button size="sm" variant="outline" className="!py-2 !px-3 !rounded-md" onClick={handlePrint}>Print</Button> */}
                            </>
                        )}
                    </div>
                </div>

                {/* Right side: search */}
                {!error && (
                    <div className="w-full sm:w-auto sm:flex-1 sm:max-w-sm">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Search</label>
                        <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={tempSearchInput}
                                onChange={(e) => setTempSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm outline-none"
                            />
                            <button onClick={handleSearch}
                                className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
                                title="Search"
                            >
                                <SearchIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-3 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center"
                                title="Clear"
                            >
                                <CrossIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="dark:border-white/[0.05] dark:bg-white/[0.03] ">
                {loading ? (
                    <div className="flex items-center justify-center h-[300px]"><Loader /></div>
                ) : error ? (
                    <div className="relative flex flex-col items-center justify-center h-48 rounded-xl bg-white dark:bg-white/[0.03] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-rose-50 dark:from-red-900/10 dark:via-transparent dark:to-rose-900/10"></div>

                        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-red-300 dark:border-red-700/50"></div>

                        <div className="relative z-10 flex flex-col items-center text-center px-4">
                            <div className="p-3 mb-3 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-full">
                                <CrossIcon className="w-12 h-12 text-red-500 dark:text-red-400" />
                            </div>

                            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                Oops! Something went wrong
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                {error}
                            </p>
                        </div>
                    </div>) : rows.length > 0 ? (
                        <div style={{ maxHeight: maxHeight ?? "400px" }} className="w-full max-w-full overflow-x-auto overflow-y-auto relative border border-gray-200 dark:border-gray-700 rounded-md scrollbar-hide hover:scrollbar-default">
                            <Table className="sticky top-0 z-40 bg-white dark:bg-card">
                                <TableHeader className="sticky top-0 z-40 bg-white dark:bg-card">
                                    <TableRow>
                                        {(onView || onDelete || onHistory || onEdit || onCheckbox || customActions) && (
                                            <TableCell isHeader className={`sticky left-0 z-40 bg-white dark:bg-card text-theme-sm px-5 py-2 font-medium text-gray-600 dark:text-gray-300 ${customActions ? 'text-left' : 'text-center'} whitespace-nowrap border-b border-gray-200 dark:border-gray-700 border-t-0 min-w-[120px]`}>
                                                {checkboxHeading || "Action"}
                                            </TableCell>
                                        )}

                                        {headers.filter(h => visibleKeys.includes(h.key)).map((header, idx) => (
                                            <TableCell
                                                key={idx}
                                                isHeader
                                                className="px-5 py-2 font-medium text-gray-600 text-center dark:text-white text-theme-sm whitespace-nowrap border border-gray-200 dark:border-gray-700 border-t-0 cursor-pointer select-none"
                                                onClick={() => handleSort(String(header.key))}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    {header.label}
                                                    <div className="flex flex-col items-center justify-center ml-1">
                                                        <ArrowUpIcon
                                                            className={`w-3 h-3 ${sortConfig.key === header.key && sortConfig.direction === "asc"
                                                                ? "text-black"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                        <ArrowDownIcon
                                                            className={`w-3 h-3 ${sortConfig.key === header.key && sortConfig.direction === "desc"
                                                                ? "text-black"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                        ))}


                                        {checkbox && (<TableCell isHeader
                                            className="z-10 border dark:bg-white/[0.03] text-theme-sm px-5 py-3 font-medium text-gray-500 text-center whitespace-nowrap border-b border-gray-200 dark:border-gray-700 border-t-0">
                                            {checkboxHeading || "Select"}</TableCell>)}
                                        {iconColumnKey && (
                                            <TableCell isHeader className="px-5 py-3 dark:text-white font-medium text-gray-500 text-center whitespace-nowrap border border-gray-200 dark:border-gray-700 border-t-0">
                                                {iconColumnKey}</TableCell>)}
                                        {actionButtonName && (
                                            <TableCell isHeader className="px-5 py-3 dark:text-white font-medium text-gray-500 text-center whitespace-nowrap border border-gray-200 dark:border-gray-700 border-t-0">
                                                {actionButtonHeader || ""}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y  divide-gray-100 dark:divide-white/[0.05]">
                                    {sortedRows.filter(row =>
                                        Object.values(row)
                                    ).map((row, rowIndex) => {
                                        const rowId = row.id || row.userId || row.userRequestId || row.studyRequestId || row.vendorRequestId || `row-${rowIndex}`;

                                        return (
                                            <TableRow key={rowIndex} className={`${row.requestedStatus === "User Rejected" || row.approvalStatus === 'Rejected' ? "bg-red-200 text-red-700" : ""}`}>
                                                {(onView || onDelete || onHistory || onEdit || onCheckbox || customActions) && (
                                                    <TableCell className={`sticky left-0 z-30 border-b ${row.requestedStatus === "User Rejected" || row.approvalStatus === 'Rejected' ? "bg-red-200 text-red-700" : "bg-white dark:bg-card"} px-4 py-1.5 whitespace-nowrap dark:border-gray-700 min-w-[120px] ${[onView, onDelete, onHistory, onEdit, onCheckbox, customActions].filter(Boolean).length > 1 ? (customActions ? 'text-start space-x-2' : 'text-center space-x-2') : 'text-center'
                                                        }`}>
                                                        <div className={`flex ${customActions ? 'justify-start' : 'justify-center'} items-center ${[onView, onDelete, onHistory, onEdit, onCheckbox, customActions].filter(Boolean).length > 1 ? "gap-2" : ""}`}>
                                                            {onCheckbox && (
                                                                <Switch
                                                                    size="small"
                                                                    checked={!!(selectedRows || {})[rowId]}
                                                                    onChange={() => {
                                                                        if (onCheckboxToggle) {
                                                                            onCheckboxToggle(row);
                                                                        } else {
                                                                            handleCheckboxChange(rowId);
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                            {onView && (
                                                                <button onClick={() => { if (!disableViewCondition?.(row)) { onView(row); } }}
                                                                    disabled={disableViewCondition?.(row)}
                                                                    className={disableViewCondition?.(row) ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}
                                                                    title={disableViewCondition?.(row) ? "View disabled" : "View"}>
                                                                    <Eyeicon className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {onEdit && (<button onClick={() => { if (!disableEditCondition?.(row)) { onEdit(row); } }}
                                                                disabled={disableEditCondition?.(row)}
                                                                className={`text-blue-600 hover:text-blue-800 ${disableEditCondition?.(row) ? 'cursor-not-allowed text-gray-400 hover:text-gray-400' : ''}`}
                                                                title={disableEditCondition?.(row) ? "Edit disabled" : "Edit"}
                                                            >
                                                                <EditIcon className="w-5 h-5" />
                                                            </button>
                                                            )}

                                                            {onDelete && (
                                                                <button onClick={() => { if (!disableDeleteCondition?.(row)) { onDelete(rowId); } }}
                                                                    disabled={disableDeleteCondition?.(row)}
                                                                    className={`${disableDeleteCondition?.(row) ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-800"}`}
                                                                    title={disableDeleteCondition?.(row) ? "Delete disabled" : "Delete"}>
                                                                    <DeleteIcon className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {onHistory && (
                                                                <button onClick={() => onHistory(row)}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                    title="History"
                                                                >
                                                                    <HistoryIcon className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {customActions && customActions(row)}
                                                        </div>
                                                    </TableCell>
                                                )}

                                                {headers.filter(h => visibleKeys.includes(h.key)).map((header, colIndex) => {
                                                    const value = row[header.key];
                                                    const isImage = typeof value === "string" && value.includes("http") && header.key === "thumbnail";
                                                    return (
                                                        <TableCell
                                                            key={colIndex}
                                                            className={`px-4 py-1 whitespace-nowrap border border-gray-200 dark:border-gray-700 ${header.button ? "text-center" : typeof value === "number" || value === "—" || value === "-" ? "text-center" : "text-start"}`}>
                                                            {header.button ? (
                                                                <button>
                                                                    {value === 'Implementation Pending' || value === "HelpDesk Pending" || value === "Pending Approval" ? 'Implement' : value}
                                                                </button>
                                                            ) : isImage ? (
                                                                <img src={value} alt="image" className="w-16 h-16 object-cover rounded" />
                                                            ) : (
                                                                <span
                                                                    onClick={() =>
                                                                        typeof value === "string" &&
                                                                        toggleCellExpansion(`${rowIndex}-${header.key.toString()}`)
                                                                    }
                                                                    className={`cursor-pointer text-sm dark:text-gray-200 ${value === "User Rejected" ||
                                                                        value === "Rejected" || value === "Offboard" ||
                                                                        value === "Offboarded" || value === "Inactive"
                                                                        ? "text-red-600"
                                                                        : value === "Approved" ||
                                                                            value === "User Approved" ||
                                                                            value === "Active"
                                                                            ? "text-blue-600"
                                                                            : value === "Implemented"
                                                                                ? "text-green-600"
                                                                                : "text-gray-800 dark:text-gray-100"
                                                                        }`}
                                                                    title="Click to toggle full text"
                                                                >
                                                                    {typeof value === "string" && !expandedCells[`${rowIndex}-${header.key.toString()}`]
                                                                        ? truncateWords(value, 4)
                                                                        : value}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}

                                                {checkbox && (
                                                    <TableCell className={`border px-4 py-1 text-center border-r border-gray-200 dark:border-gray-700
                                ${row.requestedStatus === "User Rejected" || row.approvalStatus === 'Rejected' ? "bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-white dark:bg-white/[0.03]"}`}
                                                    >
                                                        <div className="flex justify-center">
                                                            <Checkbox className={row.requestedStatus === "User Rejected" || row.approvalStatus === 'Rejected'
                                                                ? "checked:bg-red-600 checked:border-red-600 border-red-600" : ""}
                                                                checked={!!selectedRows[rowId]}
                                                                disabled={disableEditCondition?.(row) || (row.requestedStatus !== "Offboarding Pending" && row.userStatus === "Active") || row.userStatus === "Rejected" || row.userStatus === "HelpDeskPending" || row.approvalStatus == 'Approved' || row.approvalStatus == 'Rejected' || row.approvalStatus == "Implemented"}
                                                                onChange={() => handleCheckboxChange(rowId)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )}
                                                {iconColumnKey && IconComponent && (
                                                    <TableCell className="px-4 py-.5 text-center border  border-gray-200 dark:border-gray-700">
                                                        <button
                                                            onClick={() => onIconClick?.(row[iconColumnKey], row)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Icon Action"
                                                        >
                                                            <IconComponent className="w-5 h-5" />
                                                        </button>
                                                    </TableCell>
                                                )}
                                                {actionButtonName && (
                                                    <TableCell className="px-4 py-1.5 text-center border border-gray-200 dark:border-gray-700">
                                                        <button
                                                            onClick={() => onActionButtonClick?.(row)}
                                                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            {actionButtonName}
                                                        </button>
                                                    </TableCell>
                                                )}
                                            </TableRow>


                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                    // <div className="text-gray-500 text-sm px-4 py-2">No data found.</div>
                    <div className="relative flex flex-col items-center justify-center h-48 rounded-xl bg-white text-gray-600">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 via-white to-indigo-50"></div>
                        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-blue-200"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="p-3 mb-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full">
                                <InfoIcon className="w-12 h-12 text-blue-400" />
                            </div>
                            <p className="text-center text-lg font-semibold text-blue-600">No records found</p>
                        </div>
                    </div>
                )}
                {total > 0 && (
                    <div className="flex justify-end mt-4">
                        <Pagination
                            current={currentPage}
                            total={total}
                            pageSize={pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={true}
                            showQuickJumper={true}
                            onShowSizeChange={handlePageChange}
                            pageSizeOptions={['10', '20', '50', '100', '500']}
                            className="ant-pagination-custom"
                            showTotal={(total, range) => (<span className="text-gray-700 dark:text-white">
                                Showing {range[0]}-{range[1]} of {total} records</span>)} />
                    </div>
                )}
            </div>


        </div>
    );
}