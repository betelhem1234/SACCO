package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Member;
import com.example.ngrxcrud.api.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    @Autowired
    private MemberRepository memberRepository;

    @GetMapping
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    @GetMapping("/{id}")
    public Member getMember(@PathVariable UUID id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found: " + id));
    }

    @PostMapping
    public Member addMember(@RequestBody Member member) {
        return saveWithRelations(member);
    }

    @PutMapping("/{id}")
    public Member updateMember(@PathVariable UUID id, @RequestBody Member member) {
        member.setId(id);
        return saveWithRelations(member);
    }

    @DeleteMapping("/{id}")
    public void deleteMember(@PathVariable UUID id) {
        memberRepository.deleteById(id);
    }

    private Member saveWithRelations(Member member) {
        if (member.getBeneficiaries() != null) {
            member.getBeneficiaries().forEach(b -> b.setMember(member));
        }
            
        if (member.getReferrals() != null) {
            member.getReferrals().forEach(r -> r.setMember(member));
        }
        return memberRepository.save(member);
    }
}
