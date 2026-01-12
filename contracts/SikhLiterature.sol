// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SikhLiterature - store metadata + IPFS hash for submitted literature
/// @notice Anyone can submit. Owner can register validators. Validators and owner auto-approve.
contract SikhLiterature {

    // Ownership (minimal)
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Data model
    enum Status { Pending, Approved, Rejected }

    struct Record {
        uint256 id;
        string title;
        string description;
        string source;
        string ipfsHash;
        address contributor;
        uint256 timestamp;
        Status status;
        address approver; 
    }

    uint256 public nextId = 1; 
    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) private recordsBySubmitter;
    mapping(address => bool) public isValidator;

    // Events
    event RecordSubmitted(
        uint256 indexed id,
        address indexed contributor,
        string title,
        string ipfsHash,
        uint256 timestamp
    );

    event RecordApproved(uint256 indexed id, address indexed approver, uint256 timestamp);
    event RecordRejected(uint256 indexed id, address indexed approver, uint256 timestamp);
    event ValidatorUpdated(address indexed validator, bool enabled);

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Submission
    /// @notice Submit a new record (anyone)
    function submitRecord(
        string calldata _title,
        string calldata _description,
        string calldata _source,
        string calldata _ipfsHash
    ) external returns (uint256) {
        uint256 id = nextId++;
        Record storage r = records[id];
        r.id = id;
        r.title = _title;
        r.description = _description;
        r.source = _source;
        r.ipfsHash = _ipfsHash;
        r.contributor = msg.sender;
        r.timestamp = block.timestamp;
        r.status = Status.Pending;
        r.approver = address(0);

        recordsBySubmitter[msg.sender].push(id);

        emit RecordSubmitted(id, msg.sender, _title, _ipfsHash, block.timestamp);

        // Auto-approve if contributor is validator or owner
        if (msg.sender == owner || isValidator[msg.sender]) {
            _approve(id, msg.sender);
        }

        return id;
    }

    // Approve / Reject
    modifier onlyValidatorOrOwner() {
        require(msg.sender == owner || isValidator[msg.sender], "Only validator/owner");
        _;
    }

    function approveRecord(uint256 _id) external onlyValidatorOrOwner {
        require(_exists(_id), "Not exists");
        require(records[_id].status == Status.Pending, "Not pending");
        _approve(_id, msg.sender);
    }

    function _approve(uint256 _id, address _approver) internal {
        records[_id].status = Status.Approved;
        records[_id].approver = _approver;
        emit RecordApproved(_id, _approver, block.timestamp);
    }

    function rejectRecord(uint256 _id, string calldata reason) external onlyValidatorOrOwner {
        require(_exists(_id), "Not exists");
        require(records[_id].status == Status.Pending, "Not pending");
        records[_id].status = Status.Rejected;
        records[_id].approver = msg.sender;
        emit RecordRejected(_id, msg.sender, block.timestamp);
        // Note: reason is not stored to save gas, but you could emit a richer event if needed.
    }

    // Validator management
    /// @notice Owner can toggle validators on-chain (no addresses hard-coded).
    function setValidator(address _who, bool _enabled) external onlyOwner {
        isValidator[_who] = _enabled;
        emit ValidatorUpdated(_who, _enabled);
    }

    // Views and helpers
    function getRecordsBySubmitter(address _who) external view returns (uint256[] memory) {
        return recordsBySubmitter[_who];
    }

    function totalRecords() external view returns (uint256) {
        return nextId - 1;
    }

    function _exists(uint256 _id) internal view returns (bool) {
        return _id > 0 && _id < nextId;
    }

    function getRecord(uint256 _id) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory source,
        string memory ipfsHash,
        address contributor,
        uint256 timestamp,
        Status status,
        address approver
    ) {
        require(_exists(_id), "Not exists");
        Record memory r = records[_id];
        return (r.id, r.title, r.description, r.source, r.ipfsHash, r.contributor, r.timestamp, r.status, r.approver);
    }
}
