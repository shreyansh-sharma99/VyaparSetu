import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchTicketById, sendReplyToTicket, assignTicketThunk, transferTicketThunk, updateTicketStatusThunk } from "../services/helpDeskSlice";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import { ArrowLeft, Send, UserCheck, RefreshCw, Edit, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { Modal, Input } from "antd";
import Select from "../../../components/form/Select";
import Button from "../../../components/UI/button/Button";
import { fetchManagers } from "../../teamMember/teamMembers/services/teamMemberSlice";
import Loader from "@/components/UI/Loader";

const HelpDeskDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { currentTicket, ticketLoading, actionLoading } = useSelector((state: RootState) => state.helpDesk);
    const { managers, loadingManagers } = useSelector((state: RootState) => state.teamMember);



    const [replyText, setReplyText] = useState("");
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [newStatus, setNewStatus] = useState("resolved");
    const [statusNote, setStatusNote] = useState("");

    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [transferStaffId, setTransferStaffId] = useState("");
    const [transferNote, setTransferNote] = useState("");

    useEffect(() => {
        if (transferModalVisible && managers.length === 0) {
            dispatch(fetchManagers());
        }
    }, [transferModalVisible, managers.length, dispatch]);

    useEffect(() => {
        if (id) {
            dispatch(fetchTicketById(id));
        }
    }, [dispatch, id]);

    const handleReply = async () => {
        if (!replyText.trim() || !id) return;
        const res = await dispatch(sendReplyToTicket({ ticketId: id, payload: { messageText: replyText } }));
        if (sendReplyToTicket.fulfilled.match(res)) {
            toast.success("Reply sent successfully");
            setReplyText("");
            dispatch(fetchTicketById(id));
        } else {
            toast.error(res.payload as string || "Failed to send reply");
        }
    };

    const handleAssignSelf = async () => {
        if (!id) return;
        const res = await dispatch(assignTicketThunk({ ticketId: id, payload: {} }));
        if (assignTicketThunk.fulfilled.match(res)) {
            toast.success("Ticket assigned to you");
            dispatch(fetchTicketById(id));
        } else {
            toast.error(res.payload as string || "Failed to assign ticket");
        }
    };

    const handleUpdateStatus = async () => {
        if (!id) return;
        const res = await dispatch(updateTicketStatusThunk({ ticketId: id, payload: { status: newStatus, note: statusNote } }));
        if (updateTicketStatusThunk.fulfilled.match(res)) {
            toast.success("Status updated successfully");
            setStatusModalVisible(false);
            setStatusNote("");
            dispatch(fetchTicketById(id));
        } else {
            toast.error(res.payload as string || "Failed to update status");
        }
    };

    const handleTransfer = async () => {
        if (!id || !transferStaffId.trim() || !transferNote.trim()) {
            toast.error("Please provide staff ID and a note");
            return;
        }
        const res = await dispatch(transferTicketThunk({ ticketId: id, payload: { assignedStaffId: transferStaffId, transferNote } }));
        if (transferTicketThunk.fulfilled.match(res)) {
            toast.success("Ticket transferred successfully");
            setTransferModalVisible(false);
            setTransferStaffId("");
            setTransferNote("");
            dispatch(fetchTicketById(id));
        } else {
            toast.error(res.payload as string || "Failed to transfer ticket");
        }
    };

    if (ticketLoading && !currentTicket) {
        return <ComponentCard title=""><Loader />   </ComponentCard>
    }

    if (!currentTicket) {
        return <div className="p-8 text-center text-gray-500">Ticket not found</div>;
    }

    return (
        <div className="space-y-6">
            <PageMeta title={`Ticket ${currentTicket.ticketId} | VyaparSetu`} description="Ticket Details" />

            <ComponentCard
                title="Ticket Management"
                rightButtonNode={
                    <div className="flex gap-3">
                        <Button className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-0" size='xs' onClick={handleAssignSelf} disabled={actionLoading} startIcon={<UserCheck className="w-4 h-4" />}>
                            Assign to me
                        </Button>
                        <Button className="!bg-purple-600 hover:!bg-purple-700 !text-white !border-0" size='xs' onClick={() => setTransferModalVisible(true)} startIcon={<RefreshCw className="w-4 h-4" />}>
                            Transfer
                        </Button>
                        <Button className="!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-0" size='xs' onClick={() => setStatusModalVisible(true)} startIcon={<Edit className="w-4 h-4" />}>
                            Update Status
                        </Button>
                        <Button variant="danger" size='xs' onClick={() => navigate(-1)} startIcon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Tickets
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <ComponentCard title={currentTicket.subject}>
                            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentTicket.description}</p>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-500" /> Discussion
                                </h4>
                                {currentTicket.messages?.length > 0 ? (
                                    <div className="space-y-4">
                                        {currentTicket.messages.map((msg: any, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-xl ${msg.senderType === 'staff' ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' : 'bg-gray-50 dark:bg-gray-800 mr-8'}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{msg.senderName} ({msg.senderType})</span>
                                                    <span className="text-xs text-gray-500">{formatDateWithTiming(msg.createdAt)}</span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{msg.messageText}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No replies yet.</p>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Add Reply</h4>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
                                    rows={4}
                                    placeholder="Type your reply here..."
                                ></textarea>
                                <div className="flex justify-end mt-3">
                                    <Button
                                        onClick={handleReply}
                                        disabled={actionLoading || !replyText.trim()}
                                        startIcon={<Send className="w-4 h-4" />}
                                    >
                                        Send Reply
                                    </Button>
                                </div>
                            </div>
                        </ComponentCard>
                    </div>

                    <div className="space-y-6">
                        <ComponentCard title="Ticket Info">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Ticket ID</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{currentTicket.ticketId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${currentTicket.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        currentTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            currentTicket.status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {(currentTicket.status || "N/A").toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Priority</span>
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${currentTicket.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        currentTicket.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                            currentTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                        {(currentTicket.priority || "N/A").toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{currentTicket?.category?.replace('_', ' ')?.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Created At</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{formatDateWithTiming(currentTicket.createdAt)}</span>
                                </div>
                                {currentTicket.assignedStaffId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Assigned To</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">{currentTicket.assignedStaffId}</span>
                                    </div>
                                )}
                            </div>
                        </ComponentCard>

                        <ComponentCard title="Audit Logs">
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                {currentTicket.auditLogs?.map((log: any, idx: number) => (
                                    <div key={idx} className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                        <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5.5px] top-1"></div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action.toUpperCase()}</p>
                                        <p className="text-xs text-gray-500 mb-1">{formatDateWithTiming(log.createdAt)} by {log.operatorName}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-400">{log.note}</p>
                                    </div>
                                ))}
                            </div>
                        </ComponentCard>
                    </div>
                </div>
            </ComponentCard>

            <Modal
                title={<span className="text-blue-600 dark:text-blue-400 font-bold text-lg">Update Ticket Status</span>}
                open={statusModalVisible}
                onOk={handleUpdateStatus}
                onCancel={() => setStatusModalVisible(false)}
                confirmLoading={actionLoading}
                okText="Update Status"
            >
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Status</label>
                        <Select
                            value={newStatus}
                            options={[
                                { label: "Open", value: "open" },
                                { label: "Assigned", value: "assigned" },
                                { label: "In Progress", value: "in_progress" },
                                { label: "Waiting on Merchant", value: "waiting_on_merchant" },
                                { label: "Resolved", value: "resolved" },
                                { label: "Closed", value: "closed" },
                            ]}
                            onChange={setNewStatus}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Optional)</label>
                        <Input.TextArea
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="Add a note about this status change..."
                            rows={3}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                title={<span className="text-blue-600 dark:text-blue-400 font-bold text-lg">Transfer Ticket</span>}
                open={transferModalVisible}
                onOk={handleTransfer}
                onCancel={() => setTransferModalVisible(false)}
                confirmLoading={actionLoading}
                okText="Transfer"
            >
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff ID</label>
                        {loadingManagers ? (
                            <div className="text-sm text-gray-500">Loading managers...</div>
                        ) : (
                            <Select
                                value={transferStaffId}
                                options={managers?.map((m: any) => ({ label: `${m.name} (${m.email})`, value: m._id })) || []}
                                onChange={(val: string) => setTransferStaffId(val)}
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transfer Note</label>
                        <Input.TextArea
                            value={transferNote}
                            onChange={(e) => setTransferNote(e.target.value)}
                            placeholder="Reason for transfer..."
                            rows={3}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default HelpDeskDetails;
