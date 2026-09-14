package com.sparkcity.steamcon.admission;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity @Table(name="passes") public class Pass extends Admission {
 @Column(nullable=false) private String passType; public Pass(){} public Pass(UUID userId,String passType){this.userId=userId;this.passType=passType;} public String getPassType(){return passType;} public void setPassType(String v){passType=v;}
}
