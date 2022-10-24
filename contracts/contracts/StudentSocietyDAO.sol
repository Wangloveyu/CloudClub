// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./StudentToken.sol";

contract StudentItem is ERC721 {
    address public owner;
    uint256 nextToken;

    constructor() ERC721("StudentItem", "ITM") {
        owner = msg.sender;
        nextToken = 1;
    }

    function award(address to) external returns (uint256) {
        _mint(to, nextToken);
        return nextToken++;
    }
}

contract StudentSocietyDAO {
    // use a event if you want
    event TokenList(uint256 Tokens);
    event ProposalInitiated(uint32 proposalIndex);
    event StudentInitiated(address);
    struct Proposal {
        bool created; // 用于判断是否存在该协议
        uint32 index; // index of this proposal
        address proposer; // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration; // proposal duration
        string name; // proposal name
        uint agree; // 同意的人数
        uint reject; // 反对的人数
        bool complete; // 提案是否已经被完成
    }

    struct Student {
        bool exist; // 判断用户是否存在
        address userId;
        uint32 proposalId; // 存储学生提出的提案id，每个学生一次只能提出一个提案，为0时表示没有提出提案
        uint8 successNum;
        uint32 total; // 总的提案数量
        uint256 tokenId; // 学生的token，如果没有领取纪念品的话tokenId为0
        uint32[] proposals; // 学生提出的提案列表
    }
    StudentToken public studentERC20; // 存储学生内部的代币
    StudentItem public studentERC721; // NFTToken
    uint32 public nextuuid; // 下一个提案的id，也是当前提案的数量
    uint32 public MAKE_A_PROPOSAL; // 发起一个提案需要的代币数量
    uint32 public VOTE; // 投票需要消耗的代币数量

    mapping(uint32 => Proposal) public proposals; // A map from proposal index to proposal

    mapping(address => Student) public users; // 用户映射表

    // 构造函数
    constructor() {
        // maybe you need a constructor
        // 小数点后3位
        studentERC20 = new StudentToken(2000000);
        studentERC721 = new StudentItem();
        nextuuid = 1;
        MAKE_A_PROPOSAL = 20;
        VOTE = 5;
    }

    // 领取代币，仅在测试时使用，后期修改为仅有管理员可以发放代币
    function getToken() external {
        studentERC20.transfer(msg.sender, 100);
    }

    // 用户登录，没有账号则自动创建
    function login() external {
        if (users[msg.sender].exist == false) {
            // 用户不存在，则创建一个用户
            users[msg.sender] = Student(
                true,
                msg.sender,
                0,
                0,
                0,
                0,
                new uint32[](0)
            );
            // 初始获得100代币
            studentERC20.transfer(msg.sender, 100);
        }
    }

    // 检查某个提案是否完成，完成需要进行完成相关的操作
    function checkComplete(uint32 id) public {
        if (
            !proposals[id].complete &&
            proposals[id].startTime + proposals[id].duration <= block.timestamp
        ) {
            proposals[id].complete = true;
            if (proposals[id].reject >= proposals[id].agree) {
                // 拒绝的人数不小于同意人数，没法领奖，直接重置协议号
                users[proposals[id].proposer].proposalId = 0;
            } else {
                users[proposals[id].proposer].successNum++;
            }
        }
    }

    function getInformation() external returns (uint) {
        // require(users[msg.sender].exist, "user don't be created");
        // return (users[msg.sender]);
        studentERC20.approve(address(this), 200);
        studentERC20.approve(msg.sender, 200);
        return studentERC20.allowance(msg.sender, address(this));
    }

    // 发起一个提案
    function makeProposal(string memory name, uint256 duration) external {
        require(users[msg.sender].exist, "user don't be created");
        if (users[msg.sender].proposalId != 0) {
            checkComplete(users[msg.sender].proposalId); // 检查上一个提案是否完成
        }
        require(
            users[msg.sender].proposalId == 0,
            "Previous proposals have not been completed or received rewards"
        );

        // 检查代币是否足够
        require(
            studentERC20.allowance(msg.sender, address(this)) >=
                MAKE_A_PROPOSAL,
            "Your token is insufficient"
        );

        // 测试时提案默认进行6s就结束
        proposals[nextuuid] = Proposal(
            true,
            nextuuid,
            msg.sender,
            block.timestamp,
            duration, // 6s用于测试，实际上应该用户指定
            name,
            0,
            0,
            false
        );
        users[msg.sender].proposalId = nextuuid;
        users[msg.sender].total++;
        users[msg.sender].proposals.push(nextuuid);
        nextuuid++;
        studentERC20.transferFrom(msg.sender, address(this), MAKE_A_PROPOSAL);
    }

    // 同意某个提案
    function agreeProposal(uint32 id) external {
        require(users[msg.sender].exist, "user don't be created");
        require(proposals[id].created == true, "Proposal does not exist");
        require(
            proposals[id].proposer != msg.sender,
            "The sponsor of the proposal cannot vote"
        );
        checkComplete(users[msg.sender].proposalId); // 投票前检查提案是否已经完成
        require(proposals[id].complete == false, "Proposal closed");
        require(
            studentERC20.balanceOf(msg.sender) >= VOTE,
            "Your token is insufficient"
        );
        studentERC20.transferFrom(msg.sender, address(this), VOTE);
        proposals[id].agree++;
    }

    // 反对某个提案
    function rejectProposal(uint32 id) external {
        require(users[msg.sender].exist, "user don't be created");
        require(proposals[id].created == true, "Proposal does not exist");
        require(
            proposals[id].proposer != msg.sender,
            "The sponsor of the proposal cannot vote"
        );
        checkComplete(users[msg.sender].proposalId); // 投票前检查提案是否已经完成
        require(proposals[id].complete == false, "Proposal closed");
        require(
            studentERC20.balanceOf(msg.sender) >= VOTE,
            "Your token is insufficient"
        );
        studentERC20.transferFrom(msg.sender, address(this), VOTE);
        proposals[id].reject++;
    }

    // 提案通过的学生领取奖励，如果成功返回获得的token数
    function getBonus() external returns (uint) {
        require(users[msg.sender].exist, "user don't be created");
        uint32 id = users[msg.sender].proposalId;
        require(proposals[id].created, "The proposals not exist");
        checkComplete(users[msg.sender].proposalId); // 投票前检查提案是否已经完成
        require(proposals[id].complete, "the proposal is voting");
        require(
            proposals[id].agree > proposals[id].reject,
            "the proposal is rejected"
        );

        uint value = (proposals[id].agree + proposals[id].reject) *
            VOTE +
            MAKE_A_PROPOSAL;
        studentERC20.transfer(msg.sender, value);
        users[msg.sender].proposalId = 0;
        return value;
    }

    event MyERC721(uint256);

    // 领取提案通过三次的奖励
    function getKeepsake() external {
        require(users[msg.sender].exist, "user don't be created");
        require(users[msg.sender].tokenId == 0, "You have received the reward");
        require(
            users[msg.sender].successNum >= 3,
            "The number of proposals you have been approved is less than 3, and you cannot receive rewards"
        );
        users[msg.sender].tokenId = studentERC721.award(msg.sender);

        emit TokenList(users[msg.sender].tokenId);
    }

    // 获取某个提案的投票结果
    function getResult(uint32 id) external returns (string memory) {
        require(proposals[id].created, "the proposal not exist");
        checkComplete(id);

        if (proposals[id].complete) {
            if (proposals[id].agree > proposals[id].reject) {
                return "the proposals is passed";
            } else {
                return "the proposals is rejected";
            }
        } else {
            return "the proposals is voting";
        }
    }
}
