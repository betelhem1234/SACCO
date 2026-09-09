package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Member;
import com.example.ngrxcrud.api.model.MemberGroup;
import com.example.ngrxcrud.api.repository.MemberGroupRepository;
import com.example.ngrxcrud.api.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/member-groups")
@CrossOrigin(origins = "*")
public class MemberGroupController {

    @Autowired
    private MemberGroupRepository memberGroupRepository;

    @Autowired
    private MemberRepository memberRepository;

    @GetMapping("/{memberId}")
    public List<MemberGroup> getMemberGroups(@PathVariable UUID memberId) {
        List<MemberGroup> groups = memberGroupRepository.findByMember_Id(memberId);
        groups.forEach(g -> g.setMemberId(memberId));
        return groups;
    }

    @PostMapping
    public MemberGroup addMemberGroup(@RequestBody MemberGroup memberGroup) {
        UUID memberId = memberGroup.getMemberId();
        if (memberId == null) {
            throw new RuntimeException("member_id is required");
        }
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
        memberGroup.setMember(member);
        MemberGroup saved = memberGroupRepository.save(memberGroup);
        saved.setMemberId(memberId);
        return saved;
    }

    @PutMapping("/{id}")
    public MemberGroup updateMemberGroup(@PathVariable UUID id, @RequestBody MemberGroup memberGroup) {
        MemberGroup existing = memberGroupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("MemberGroup not found: " + id));
        UUID memberId = existing.getMember().getId();
        memberGroup.setId(id);
        memberGroup.setMember(existing.getMember());
        memberGroup.setMemberId(memberId);
        return memberGroupRepository.save(memberGroup);
    }

    @DeleteMapping("/{id}")
    public void deleteMemberGroup(@PathVariable UUID id) {
        memberGroupRepository.deleteById(id);
    }
}
